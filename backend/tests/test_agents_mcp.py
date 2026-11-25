import sys
import uuid
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

APP_ROOT = Path(__file__).resolve().parents[1]
if str(APP_ROOT) not in sys.path:
    sys.path.insert(0, str(APP_ROOT))

from app.db.session import SessionLocal
from app.main import app
from app.models.user import User


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def auth_headers(client: TestClient):
    email = f"mcp-{uuid.uuid4().hex[:8]}@example.com"
    reg = client.post("/api/v1/auth/register", json={"name": "MCP Test", "email": email, "password": "TestPassword123!"})
    assert reg.status_code == 201
    yield {"Authorization": f"Bearer {reg.json()['access_token']}"}
    with SessionLocal() as db:
        db.execute(delete(User).where(User.email == email))
        db.commit()


def test_mcp_jsonrpc_and_tools_list(client: TestClient, auth_headers: dict):
    init_res = client.post("/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "initialize"}, headers=auth_headers)
    assert init_res.status_code == 200
    assert init_res.json()["result"]["serverInfo"]["name"] == "grocify-mcp-server"

    list_res = client.post("/mcp", json={"jsonrpc": "2.0", "id": 2, "method": "tools/list"}, headers=auth_headers)
    assert list_res.status_code == 200
    tool_names = [t["name"] for t in list_res.json()["result"]["tools"]]
    assert "pantry_inventory" in tool_names
    assert "store_price_compare" in tool_names

    call_res = client.post(
        "/mcp",
        json={"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "usda_nutrition_lookup", "arguments": {"query": "Paneer"}}},
        headers=auth_headers,
    )
    assert call_res.status_code == 200
    assert call_res.json()["result"]["structuredContent"]["calories"] == 265


def test_multi_agent_orchestrator_runs_specialists_and_debate(client: TestClient, auth_headers: dict):
    reg_res = client.get("/api/v1/agents/registry", headers=auth_headers)
    assert reg_res.status_code == 200
    assert len(reg_res.json()["agents"]) == 9

    run_res = client.post(
        "/api/v1/agents/run",
        json={"goal": "Plan tonight's dinner and check budget"},
        headers=auth_headers,
    )
    assert run_res.status_code == 200
    body = run_res.json()
    assert len(body["agent_steps"]) == 9
    assert len(body["mcp_tool_calls"]) >= 6
    assert "Action Plan" in body["final_plan"] or len(body["final_plan"]) > 20
