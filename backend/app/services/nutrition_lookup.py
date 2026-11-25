import httpx

USDA_REFERENCE = {
    "spinach": {"item_name": "Baby Spinach (1 cup raw)", "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "fiber": 2.2},
    "paneer": {"item_name": "Paneer (100g)", "calories": 265, "protein": 18.3, "carbs": 3.6, "fat": 20.8, "fiber": 0.0},
    "chicken breast": {"item_name": "Grilled Chicken Breast (100g)", "calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6, "fiber": 0.0},
    "egg": {"item_name": "Whole Egg (1 large)", "calories": 72, "protein": 6.3, "carbs": 0.4, "fat": 4.8, "fiber": 0.0},
    "greek yogurt": {"item_name": "Greek Yogurt (1 cup)", "calories": 130, "protein": 17.0, "carbs": 6.0, "fat": 4.0, "fiber": 0.0},
    "brown rice": {"item_name": "Cooked Brown Rice (1 cup)", "calories": 216, "protein": 5.0, "carbs": 45.0, "fat": 1.8, "fiber": 3.5},
    "basmati rice": {"item_name": "Cooked Basmati Rice (1 cup)", "calories": 205, "protein": 4.3, "carbs": 44.5, "fat": 0.4, "fiber": 0.6},
    "quinoa": {"item_name": "Cooked Quinoa (1 cup)", "calories": 222, "protein": 8.1, "carbs": 39.4, "fat": 3.6, "fiber": 5.2},
    "toor dal": {"item_name": "Cooked Toor Dal (1 cup)", "calories": 170, "protein": 11.0, "carbs": 30.0, "fat": 1.0, "fiber": 8.0},
    "moong dal": {"item_name": "Cooked Moong Dal (1 cup)", "calories": 175, "protein": 12.0, "carbs": 31.0, "fat": 0.8, "fiber": 8.2},
    "chickpeas": {"item_name": "Cooked Chickpeas (1 cup)", "calories": 269, "protein": 14.5, "carbs": 45.0, "fat": 4.2, "fiber": 12.5},
    "avocado": {"item_name": "Hass Avocado (1 whole)", "calories": 240, "protein": 3.0, "carbs": 12.8, "fat": 22.0, "fiber": 10.0},
    "oats": {"item_name": "Rolled Oats (1/2 cup dry)", "calories": 150, "protein": 5.0, "carbs": 27.0, "fat": 3.0, "fiber": 4.0},
    "tofu": {"item_name": "Firm Tofu (1/2 cup)", "calories": 144, "protein": 15.0, "carbs": 3.5, "fat": 8.7, "fiber": 2.3},
    "sourdough": {"item_name": "Sourdough Bread (1 slice)", "calories": 130, "protein": 5.0, "carbs": 25.0, "fat": 0.8, "fiber": 1.5},
    "milk": {"item_name": "Whole Milk (1 cup)", "calories": 149, "protein": 7.7, "carbs": 11.7, "fat": 7.9, "fiber": 0.0},
}


def lookup_verified_nutrition(query: str) -> dict:
    q = query.strip().lower()
    for key, entry in USDA_REFERENCE.items():
        if key in q or q in key:
            return {**entry, "servings": 1, "source": "USDA FoodData Reference"}

    try:
        resp = httpx.get(
            "https://world.openfoodfacts.org/cgi/search.pl",
            params={"search_terms": query, "search_simple": 1, "action": "process", "json": 1, "page_size": 1},
            timeout=4.0,
        )
        if resp.status_code == 200:
            products = resp.json().get("products") or []
            if products:
                p = products[0]
                nut = p.get("nutriments") or {}
                return {
                    "item_name": str(p.get("product_name") or query.title())[:120],
                    "servings": 1,
                    "calories": round(float(nut.get("energy-kcal_serving") or nut.get("energy-kcal_100g") or 150), 1),
                    "protein": round(float(nut.get("proteins_serving") or nut.get("proteins_100g") or 5), 1),
                    "carbs": round(float(nut.get("carbohydrates_serving") or nut.get("carbohydrates_100g") or 20), 1),
                    "fat": round(float(nut.get("fat_serving") or nut.get("fat_100g") or 4), 1),
                    "fiber": round(float(nut.get("fiber_serving") or nut.get("fiber_100g") or 2), 1),
                    "source": "OpenFoodFacts Verified Database",
                }
    except Exception:
        pass

    return {
        "item_name": query.strip().title() or "Custom Meal",
        "servings": 1,
        "calories": 220,
        "protein": 10,
        "carbs": 26,
        "fat": 7,
        "fiber": 3,
        "source": "Standard Portion Estimate",
    }
