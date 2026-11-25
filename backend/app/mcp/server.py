from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.cart import CartItem
from app.models.meal_plan import WeeklyMealPlan
from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.models.profile import UserProfile
from app.models.user import User
from app.models.waste_log import WasteLog
from app.services.barcode_lookup import lookup_barcode
from app.services.nutrition_lookup import lookup_verified_nutrition
from app.services.price_compare import compare_cart_prices
from app.services.recommendations import build_recommendations


router = APIRouter(tags=["mcp"])


MCP_TOOLS: list[dict[str, Any]] = [
    {
        "name": "pantry_inventory",
        "description": "Deterministic read of user's pantry items, locations, and expiring-soon items.",
        "inputSchema": {
            "type": "object",
            "properties": {"max_days_left": {"type": "integer", "description": "Optional expiry filter"}},
        },
    },
    {
        "name": "waste_analytics",
        "description": "Deterministic read of trash-bin waste logs, money lost, and CO2e footprint.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "usda_nutrition_lookup",
        "description": "Deterministic nutrition lookup against USDA FoodData reference and OpenFoodFacts.",
        "inputSchema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
    {
        "name": "store_price_compare",
        "description": "Deterministic cart price comparison across regional grocery stores.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "meal_recommender",
        "description": "Deterministic freshness-first meal & shopping recommendations from pantry + calories.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "weekly_meal_plan",
        "description": "Deterministic read of scheduled weekly meals and missing ingredients.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "barcode_lookup",
        "description": "Deterministic UPC/EAN product lookup via OpenFoodFacts.",
        "inputSchema": {
            "type": "object",
            "properties": {"code": {"type": "string"}},
            "required": ["code"],
        },
    },
]


def execute_mcp_tool(name: str, arguments: dict[str, Any], db: Session, user: User) -> dict[str, Any]:
    """Execute a deterministic MCP tool scoped to the authenticated user."""
    if name == "pantry_inventory":
        max_days = arguments.get("max_days_left")
        stmt = select(PantryItem).where(PantryItem.user_id == user.id).order_by(PantryItem.days_left.asc())
        items = db.scalars(stmt).all()
        if max_days is not None:
            items = [i for i in items if i.days_left <= int(max_days)]
        return {
            "count": len(items),
            "total_value": round(sum(float(i.price) for i in items), 2),
            "items": [
                {
                    "name": i.name,
                    "quantity": i.quantity,
                    "unit": i.unit,
                    "category": i.category,
                    "location": getattr(i, "location", "Home"),
                    "days_left": i.days_left,
                    "price": i.price,
                }
                for i in items[:15]
            ],
        }

    if name == "waste_analytics":
        logs = db.scalars(select(WasteLog).where(WasteLog.user_id == user.id).order_by(WasteLog.id.desc())).all()
        return {
            "total_wasted_items": len(logs),
            "total_value_lost": round(sum(float(w.estimated_value) for w in logs), 2),
            "total_co2_kg": round(sum(float(w.co2_kg) for w in logs), 2),
            "recent": [{"item_name": w.item_name, "value": w.estimated_value, "co2_kg": w.co2_kg} for w in logs[:5]],
        }

    if name == "usda_nutrition_lookup":
        query = str(arguments.get("query") or "Spinach")
        return lookup_verified_nutrition(query)

    if name == "store_price_compare":
        cart_items = db.scalars(select(CartItem).where(CartItem.user_id == user.id)).all()
        return compare_cart_prices(cart_items)

    if name == "meal_recommender":
        pantry_items = db.scalars(select(PantryItem).where(PantryItem.user_id == user.id)).all()
        nutrition_entries = db.scalars(select(NutritionEntry).where(NutritionEntry.user_id == user.id)).all()
        calorie_target = (user.profile or UserProfile(user_id=user.id)).calorie_target
        rec = build_recommendations(pantry_items, nutrition_entries, calorie_target)
        return rec.model_dump()

    if name == "weekly_meal_plan":
        meals = db.scalars(select(WeeklyMealPlan).where(WeeklyMealPlan.user_id == user.id)).all()
        return {
            "scheduled_count": len(meals),
            "meals": [
                {"day": m.day, "title": m.title, "servings": m.servings, "missing_ingredients": m.missing_ingredients}
                for m in meals
            ],
        }

    if name == "barcode_lookup":
        return lookup_barcode(str(arguments.get("code") or "011110416605"))

    raise HTTPException(status_code=404, detail=f"Unknown MCP tool: {name}")


class JsonRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: str | int | None = 1
    method: str
    params: dict[str, Any] = Field(default_factory=dict)


@router.get("/api/v1/mcp/tools")
def list_mcp_tools(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    return {"protocol": "MCP-2025-Streamable-HTTP", "server": "grocify-mcp-server", "tools": MCP_TOOLS}


@router.post("/mcp")
def mcp_jsonrpc_endpoint(
    payload: JsonRpcRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """MCP JSON-RPC 2.0 endpoint supporting initialize, tools/list, and tools/call."""
    if payload.method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": payload.id,
            "result": {
                "protocolVersion": "2025-03-26",
                "serverInfo": {"name": "grocify-mcp-server", "version": "1.0.0"},
                "capabilities": {"tools": {"listChanged": False}},
            },
        }
    if payload.method == "tools/list":
        return {"jsonrpc": "2.0", "id": payload.id, "result": {"tools": MCP_TOOLS}}
    if payload.method == "tools/call":
        tool_name = str(payload.params.get("name") or "")
        arguments = payload.params.get("arguments") or {}
        output = execute_mcp_tool(tool_name, arguments, db=db, user=current_user)
        return {
            "jsonrpc": "2.0",
            "id": payload.id,
            "result": {"content": [{"type": "text", "text": str(output)}], "structuredContent": output},
        }
    return {
        "jsonrpc": "2.0",
        "id": payload.id,
        "error": {"code": -32601, "message": f"Method not found: {payload.method}"},
    }
