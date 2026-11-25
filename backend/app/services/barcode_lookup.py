import httpx

DEMO_BARCODES = {
    "011110416605": {
        "name": "Organic Whole Milk",
        "quantity": 1,
        "unit": "gallon",
        "category": "Dairy",
        "location": "Home",
        "days_left": 7,
        "price": 4.49,
        "nutrition": {"calories": 150, "protein": 8, "carbs": 12, "fat": 8, "fiber": 0},
        "source": "OpenFoodFacts / Verified Barcode",
    },
    "041303001028": {
        "name": "Rolled Oats",
        "quantity": 1,
        "unit": "canister",
        "category": "Grains",
        "location": "Home",
        "days_left": 180,
        "price": 3.99,
        "nutrition": {"calories": 150, "protein": 5, "carbs": 27, "fat": 3, "fiber": 4},
        "source": "OpenFoodFacts / Verified Barcode",
    },
    "0737628064502": {
        "name": "Basmati Rice",
        "quantity": 2,
        "unit": "lbs",
        "category": "Grains",
        "location": "Home",
        "days_left": 180,
        "price": 6.49,
        "nutrition": {"calories": 205, "protein": 4, "carbs": 45, "fat": 0, "fiber": 1},
        "source": "OpenFoodFacts / Verified Barcode",
    },
}


def lookup_barcode(code: str) -> dict:
    clean = code.strip()
    if clean in DEMO_BARCODES:
        return {"barcode": clean, **DEMO_BARCODES[clean]}

    try:
        resp = httpx.get(
            f"https://world.openfoodfacts.org/api/v2/product/{clean}.json",
            timeout=5.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            product = data.get("product") or {}
            name = product.get("product_name") or product.get("generic_name")
            if name:
                nut = product.get("nutriments") or {}
                categories = (product.get("categories") or "").lower()
                category = "Dairy" if "milk" in categories or "dairy" in categories else "Produce" if "fruit" in categories or "vegetable" in categories else "Pantry"
                days_left = 7 if category == "Dairy" else 5 if category == "Produce" else 60
                return {
                    "barcode": clean,
                    "name": str(name)[:120],
                    "quantity": 1,
                    "unit": "pack",
                    "category": category,
                    "location": "Home",
                    "days_left": days_left,
                    "price": 4.99,
                    "nutrition": {
                        "calories": round(float(nut.get("energy-kcal_serving") or nut.get("energy-kcal_100g") or 120), 1),
                        "protein": round(float(nut.get("proteins_serving") or nut.get("proteins_100g") or 4), 1),
                        "carbs": round(float(nut.get("carbohydrates_serving") or nut.get("carbohydrates_100g") or 15), 1),
                        "fat": round(float(nut.get("fat_serving") or nut.get("fat_100g") or 3), 1),
                        "fiber": round(float(nut.get("fiber_serving") or nut.get("fiber_100g") or 2), 1),
                    },
                    "source": "OpenFoodFacts Live API",
                }
    except Exception:
        pass

    return {
        "barcode": clean,
        "name": f"Scanned Product ({clean[-4:]})",
        "quantity": 1,
        "unit": "pcs",
        "category": "Pantry",
        "location": "Home",
        "days_left": 14,
        "price": 3.99,
        "nutrition": {"calories": 120, "protein": 4, "carbs": 16, "fat": 3, "fiber": 2},
        "source": "Local Fallback Estimate",
    }
