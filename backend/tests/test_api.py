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
    email = f"pytest-{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPassword123!"
    reg = client.post(
        "/api/v1/auth/register",
        json={"name": "Pytest User", "email": email, "password": password},
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    yield {"Authorization": f"Bearer {token}"}

    with SessionLocal() as db:
        db.execute(delete(User).where(User.email == email))
        db.commit()


def test_health_check_reports_db_and_redis(client: TestClient):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["database"] == "connected"
    assert body["redis"] == "connected"


def test_protected_routes_require_jwt(client: TestClient):
    res = client.get("/api/v1/pantry")
    assert res.status_code == 401


def test_pantry_recommendations_and_expiry_risk(client: TestClient, auth_headers: dict):
    pantry_payload = [
        {
            "name": "Spinach",
            "quantity": 2,
            "unit": "bunches",
            "category": "Produce",
            "days_left": 1,
            "price": 2.99,
            "nutrition": {"calories": 23, "protein": 3, "carbs": 4, "fat": 0, "fiber": 2},
        },
        {
            "name": "Paneer",
            "quantity": 1,
            "unit": "pack",
            "category": "Dairy",
            "days_left": 2,
            "price": 4.99,
            "nutrition": {"calories": 265, "protein": 18, "carbs": 4, "fat": 20, "fiber": 0},
        },
        {
            "name": "Tomatoes",
            "quantity": 3,
            "unit": "pcs",
            "category": "Produce",
            "days_left": 3,
            "price": 3.49,
            "nutrition": {"calories": 22, "protein": 1, "carbs": 5, "fat": 0, "fiber": 2},
        },
    ]
    put_res = client.put("/api/v1/pantry", json=pantry_payload, headers=auth_headers)
    assert put_res.status_code == 200
    assert len(put_res.json()["pantry"]) == 3

    rec_res = client.get("/api/v1/recommendations", headers=auth_headers)
    assert rec_res.status_code == 200
    assert rec_res.json()["food_waste_risk"] == "high"
    assert len(rec_res.json()["meal_ideas"]) >= 1


def test_recipe_schedule_missing_cart_and_mark_cooked(client: TestClient, auth_headers: dict):
    client.put(
        "/api/v1/pantry",
        json=[
            {
                "name": "Baby Spinach",
                "quantity": 2,
                "unit": "bunches",
                "category": "Produce",
                "days_left": 2,
                "price": 2.99,
                "nutrition": {"calories": 25, "protein": 3, "carbs": 4, "fat": 0, "fiber": 2},
            }
        ],
        headers=auth_headers,
    )

    recipe_res = client.post(
        "/api/v1/recommendations/recipe",
        json={"preferences": "indian", "allergies": ["nuts"], "servings": 2, "budget": 15},
        headers=auth_headers,
    )
    assert recipe_res.status_code == 200
    recipe = recipe_res.json()

    sched_res = client.put(
        "/api/v1/meal-plan/Monday",
        json={"title": recipe["title"], "servings": 2, "ingredients": recipe["ingredients"]},
        headers=auth_headers,
    )
    assert sched_res.status_code == 200

    cart_res_1 = client.post("/api/v1/meal-plan/Monday/missing-to-cart", headers=auth_headers)
    assert cart_res_1.status_code == 200
    count_1 = len(cart_res_1.json()["cart_items"])
    assert count_1 >= 1

    # Calling missing-to-cart a second time must not duplicate items
    cart_res_2 = client.post("/api/v1/meal-plan/Monday/missing-to-cart", headers=auth_headers)
    assert cart_res_2.status_code == 200
    assert len(cart_res_2.json()["cart_items"]) == count_1

    cook_res = client.post("/api/v1/meal-plan/Monday/cook", headers=auth_headers)
    assert cook_res.status_code == 200
    assert cook_res.json()["status"] == "cooked"
    assert "Baby Spinach" in cook_res.json()["deducted_items"]

    pantry_after = client.get("/api/v1/pantry", headers=auth_headers).json()["pantry"]
    assert pantry_after[0]["quantity"] == 1

    nutrition_after = client.get("/api/v1/nutrition", headers=auth_headers).json()["calorie_entries"]
    assert len(nutrition_after) == 1
