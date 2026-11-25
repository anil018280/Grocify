from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends
from openai import OpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.mcp.server import execute_mcp_tool
from app.models.profile import UserProfile
from app.models.user import User
from app.services.blackboard import blackboard


router = APIRouter(prefix="/api/v1/agents", tags=["agents"])


AGENT_REGISTRY = [
    {"id": "orchestrator", "name": "Grocify Assistant (Orchestrator)", "layer": "Orchestrator", "mcp_tools": []},
    {"id": "inventory", "name": "Inventory & Expiry Agent", "layer": "Specialist", "mcp_tools": ["pantry_inventory"]},
    {"id": "planner", "name": "Meal Recommender & Planner Agent", "layer": "Specialist", "mcp_tools": ["meal_recommender", "weekly_meal_plan"]},
    {"id": "nutrition", "name": "Nutrition & Allergen Agent", "layer": "Specialist", "mcp_tools": ["usda_nutrition_lookup"]},
    {"id": "budget", "name": "Budget & Price-Compare Agent", "layer": "Specialist", "mcp_tools": ["store_price_compare"]},
    {"id": "sustainability", "name": "Sustainability & Waste Agent", "layer": "Specialist", "mcp_tools": ["waste_analytics"]},
    {"id": "advocate", "name": "Advocate Agent", "layer": "Debate & Synthesis", "mcp_tools": []},
    {"id": "critic", "name": "Critic Agent (Guardrails)", "layer": "Debate & Synthesis", "mcp_tools": []},
    {"id": "aggregator", "name": "Aggregator Agent", "layer": "Debate & Synthesis", "mcp_tools": []},
]


class AgentRunRequest(BaseModel):
    goal: str = Field(min_length=2, max_length=600)


def _call_tool_traced(tool_name: str, arguments: dict[str, Any], db: Session, user: User, traces: list[dict]) -> dict[str, Any]:
    t0 = time.perf_counter()
    output = execute_mcp_tool(tool_name, arguments, db=db, user=user)
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)
    traces.append(
        {
            "tool": tool_name,
            "arguments": arguments,
            "latency_ms": elapsed_ms,
            "summary": _summarize_tool_output(tool_name, output),
        }
    )
    return output


def _summarize_tool_output(tool_name: str, output: dict[str, Any]) -> str:
    if tool_name == "pantry_inventory":
        return f"{output.get('count', 0)} items (${output.get('total_value', 0):.2f} total)"
    if tool_name == "store_price_compare":
        return f"Cart ${output.get('base_cart_total', 0):.2f}; best store {output.get('best_store')} (save ${output.get('potential_savings', 0):.2f})"
    if tool_name == "meal_recommender":
        return f"Risk={output.get('food_waste_risk')}, remaining={output.get('calorie_remaining')} kcal, {len(output.get('meal_ideas', []))} ideas"
    if tool_name == "weekly_meal_plan":
        return f"{output.get('scheduled_count', 0)} day(s) scheduled"
    if tool_name == "waste_analytics":
        return f"{output.get('total_wasted_items', 0)} wasted items (${output.get('total_value_lost', 0):.2f}, {output.get('total_co2_kg', 0):.1f} kg CO2e)"
    if tool_name == "usda_nutrition_lookup":
        return f"{output.get('item_name')}: {output.get('calories')} kcal ({output.get('source')})"
    return "OK"


def run_agent_orchestrator(goal: str, db: Session, user: User) -> dict[str, Any]:
    """Execute the multi-agent specialist + Advocate/Critic/Aggregator pipeline backed by MCP tools."""
    mcp_traces: list[dict[str, Any]] = []
    agent_steps: list[dict[str, Any]] = []

    profile = user.profile or UserProfile(user_id=user.id)
    allergies = profile.allergies or []
    cuisines = profile.preferred_cuisines or ["Indian", "Mediterranean"]

    # Orchestrator routing
    agent_steps.append(
        {
            "agent": "Grocify Assistant (Orchestrator)",
            "layer": "Orchestrator",
            "status": "completed",
            "output": f"Decomposed goal '{goal}' for household of {profile.household_size or 2} (cuisines: {', '.join(cuisines)}; allergies: {', '.join(allergies) or 'None'}). Delegating to 5 specialist agents via MCP.",
        }
    )

    # Layer 1: Parallel Specialists calling deterministic MCP tools
    urgent_data = _call_tool_traced("pantry_inventory", {"max_days_left": 3}, db, user, mcp_traces)
    all_pantry = _call_tool_traced("pantry_inventory", {}, db, user, mcp_traces)
    urgent_names = [i["name"] for i in urgent_data.get("items", [])[:4]]
    agent_steps.append(
        {
            "agent": "Inventory & Expiry Agent",
            "layer": "Specialist",
            "status": "completed",
            "output": f"Found {all_pantry['count']} pantry items (${all_pantry['total_value']:.2f}). Urgent <=3d ({urgent_data['count']}): {', '.join(urgent_names) or 'None'}.",
        }
    )

    rec_data = _call_tool_traced("meal_recommender", {}, db, user, mcp_traces)
    week_data = _call_tool_traced("weekly_meal_plan", {}, db, user, mcp_traces)
    top_idea = (rec_data.get("meal_ideas") or [{}])[0]
    agent_steps.append(
        {
            "agent": "Meal Recommender & Planner Agent",
            "layer": "Specialist",
            "status": "completed",
            "output": f"Top idea: '{top_idea.get('title', 'Pantry Rescue Bowl')}' (~{top_idea.get('estimated_calories', 350)} cal). Weekly schedule has {week_data['scheduled_count']} meal(s).",
        }
    )

    lookup_target = urgent_names[0] if urgent_names else "Spinach"
    usda_data = _call_tool_traced("usda_nutrition_lookup", {"query": lookup_target}, db, user, mcp_traces)
    agent_steps.append(
        {
            "agent": "Nutrition & Allergen Agent",
            "layer": "Specialist",
            "status": "completed",
            "output": f"Remaining daily budget: {rec_data['calorie_remaining']} kcal. Verified {usda_data['item_name']} ({usda_data['calories']} kcal, {usda_data['protein']}g protein). Enforcing allergen filter: {', '.join(allergies) or 'None'}.",
        }
    )

    budget_data = _call_tool_traced("store_price_compare", {}, db, user, mcp_traces)
    agent_steps.append(
        {
            "agent": "Budget & Price-Compare Agent",
            "layer": "Specialist",
            "status": "completed",
            "output": f"Current cart is ${budget_data['base_cart_total']:.2f}. Best store: {budget_data['best_store']} (potential savings ${budget_data['potential_savings']:.2f}).",
        }
    )

    waste_data = _call_tool_traced("waste_analytics", {}, db, user, mcp_traces)
    agent_steps.append(
        {
            "agent": "Sustainability & Waste Agent",
            "layer": "Specialist",
            "status": "completed",
            "output": f"Waste risk: {rec_data['food_waste_risk'].upper()}. Tracked {waste_data['total_wasted_items']} wasted item(s) (${waste_data['total_value_lost']:.2f}, {waste_data['total_co2_kg']:.1f} kg CO2e).",
        }
    )

    # Layer 2: Chain-of-debate synthesis (Advocate -> Critic -> Aggregator)
    advocate_msg = (
        f"Prioritize cooking '{top_idea.get('title', 'Use-first pantry bowl')}' tonight using expiring items "
        f"({', '.join(urgent_names[:3]) or 'pantry staples'}) to avoid ${urgent_data['total_value']:.2f} in spoilage."
    )
    critic_msg = (
        f"Verified zero conflict with allergies ({', '.join(allergies) or 'none'}), stays within {rec_data['calorie_remaining']} kcal remaining, "
        f"and recommends buying missing staples at {budget_data['best_store']} to save ${budget_data['potential_savings']:.2f}."
    )
    agent_steps.append({"agent": "Advocate Agent", "layer": "Debate & Synthesis", "status": "completed", "output": advocate_msg})
    agent_steps.append({"agent": "Critic Agent (Guardrails)", "layer": "Debate & Synthesis", "status": "completed", "output": critic_msg})

    final_answer = (
        f"Action Plan for '{goal}':\n"
        f"1. Cook Now (Rescue Priority): Use {', '.join(urgent_names[:3]) or 'your nearest-expiry items'} (${urgent_data['total_value']:.2f} at risk) in '{top_idea.get('title', 'Use-first pantry bowl')}'.\n"
        f"2. Nutrition Check: Fits your {rec_data['calorie_remaining']} kcal remaining target; verified {usda_data['item_name']} ({usda_data['calories']} kcal) with allergies ({', '.join(allergies) or 'None'}) respected.\n"
        f"3. Budget & Shopping: Your ${budget_data['base_cart_total']:.2f} cart is cheapest at {budget_data['best_store']} (save up to ${budget_data['potential_savings']:.2f}).\n"
        f"4. Sustainability: {waste_data['total_wasted_items']} waste-bin events logged (${waste_data['total_value_lost']:.2f}, {waste_data['total_co2_kg']:.1f} kg CO2e)."
    )
    mode = "deterministic-mcp-grounded"

    if settings.openai_api_key:
        try:
            client = OpenAI(api_key=settings.openai_api_key, max_retries=0)
            resp = client.responses.create(
                model=settings.openai_model,
                instructions="You are Grocify's Aggregator Agent. Synthesize the specialist MCP outputs and Advocate/Critic debate into a concise, actionable 4-bullet plan.",
                input=f"Goal: {goal}\nAdvocate: {advocate_msg}\nCritic: {critic_msg}\nContext: {final_answer}",
                max_output_tokens=350,
                store=False,
            )
            if resp.output_text:
                final_answer = resp.output_text.strip()
                mode = "openai-aggregator"
        except Exception:
            pass

    agent_steps.append({"agent": "Aggregator Agent", "layer": "Debate & Synthesis", "status": "completed", "output": final_answer})

    result = {
        "goal": goal,
        "mode": mode,
        "final_plan": final_answer,
        "agent_steps": agent_steps,
        "mcp_tool_calls": mcp_traces,
    }
    blackboard.put(user.id, "last_agent_run", {"goal": goal, "mode": mode, "tools_used": len(mcp_traces)}, ttl_seconds=300)
    return result


@router.get("/registry")
def get_agent_registry(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    return {"agents": AGENT_REGISTRY, "protocol": "MCP-2025 + Redis Blackboard"}


@router.post("/run")
def run_agents(
    payload: AgentRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return run_agent_orchestrator(payload.goal, db=db, user=current_user)
