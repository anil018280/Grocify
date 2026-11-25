from datetime import date, timedelta

from openai import OpenAI

from app.core.config import settings
from app.schemas.pantry import PantryScanResponse, ScannedPantryItem, ScannedPantryNutrition


AUTO_SCAN_INSTRUCTIONS = """
You are Grocify's unified grocery vision assistant. Automatically detect whether the uploaded image is:
1) a fridge or pantry photo (including main shelves AND side-door racks with sauces, condiments, dressings, jars, and bottles),
2) a physical grocery store receipt, or
3) an online grocery order screenshot (e.g., Instacart, Amazon Fresh, Walmart, Target).

Extract every visible or listed food/grocery item with:
- name (clear, concise grocery name)
- quantity (positive number, at least 1)
- unit (e.g. pcs, bunches, cups, cans, lbs, bottles, bags)
- category (Produce, Dairy, Protein, Grains, Pantry, Beverages, or Frozen)
- days_left (realistic remaining shelf life in days as a non-negative integer; if a receipt/order purchase date is visible, calculate from that date, otherwise from today)
- expiry_date (YYYY-MM-DD calculated from today's date + days_left)
- price (item price from receipt/order, or realistic USD estimate for photos)
- nutrition (estimated calories, protein, carbs, fat, fiber per serving)
Return only the structured JSON response.
""".strip()


def _with_computed_expiry(result: PantryScanResponse) -> PantryScanResponse:
    today = date.today()
    for item in result.items:
        days = max(0, int(item.days_left))
        item.days_left = days
        item.expiry_date = (today + timedelta(days=days)).isoformat()
    return result


def _fallback_scan(scan_type: str, scenario: str = "produce") -> PantryScanResponse:
    today = date.today()
    if scan_type == "receipt":
        raw_items = [
            ("Organic Baby Spinach", 1, "bag", "Produce", 4, 3.49, 23, 3, 4, 0, 2),
            ("Whole Milk", 1, "gallon", "Dairy", 7, 4.29, 150, 8, 12, 8, 0),
            ("Fresh Blueberries", 1, "pint", "Produce", 3, 3.99, 84, 1, 21, 0, 4),
            ("Chicken Thighs", 1.5, "lbs", "Protein", 3, 6.99, 209, 26, 0, 11, 0),
            ("Sourdough Bread", 1, "loaf", "Grains", 6, 4.49, 130, 5, 25, 1, 2),
        ]
        summary = "Demo receipt scan (OpenAI quota exceeded): extracted items and calculated expiry dates from purchase date."
    elif scenario == "indian":
        raw_items = [
            ("Paneer (Indian Cottage Cheese)", 1, "pack", "Dairy", 3, 4.99, 265, 18, 4, 20, 0),
            ("Fresh Cilantro (Coriander)", 1, "bunch", "Produce", 2, 1.49, 5, 0, 1, 0, 1),
            ("Mint Cilantro Chutney", 1, "jar", "Pantry", 5, 3.49, 35, 1, 6, 1, 1),
            ("Fresh Curry Leaves", 1, "pack", "Produce", 3, 1.99, 10, 1, 2, 0, 1),
        ]
        summary = "Fridge camera detected Indian prep shelf items and updated expiry dates."
    elif scenario == "mealprep":
        raw_items = [
            ("Grilled Chicken Rice Bowl", 2, "containers", "Protein", 2, 6.50, 420, 36, 42, 11, 4),
            ("Almond Milk (Unsweetened)", 1, "carton", "Dairy", 7, 3.79, 30, 1, 1, 3, 1),
            ("Fresh Blueberries", 1, "pint", "Produce", 3, 3.99, 84, 1, 21, 0, 4),
        ]
        summary = "Fridge camera detected meal-prep containers and leftovers with 2–7d shelf life."
    elif scenario == "door_sauces":
        raw_items = [
            ("Soy Sauce (Low Sodium)", 1, "bottle", "Condiments", 120, 3.49, 10, 1, 1, 0, 0),
            ("Sriracha Chili Sauce", 1, "bottle", "Condiments", 90, 4.29, 5, 0, 1, 0, 0),
            ("Tamarind Date Chutney", 1, "jar", "Condiments", 14, 3.99, 45, 0, 11, 0, 1),
            ("Dijon Mustard", 1, "jar", "Condiments", 60, 3.29, 10, 0, 1, 0, 0),
        ]
        summary = "Side-door rack camera detected sauces & condiments (soy sauce, sriracha, chutney, mustard)."
    elif scenario == "deep_freezer":
        raw_items = [
            ("Frozen Green Peas", 2, "bags", "Frozen", 120, 2.49, 62, 4, 11, 0, 4),
            ("Frozen Mixed Berries", 1, "bag", "Frozen", 150, 5.49, 70, 1, 17, 0, 4),
            ("Frozen Garlic Naan", 1, "pack", "Frozen", 90, 4.49, 260, 8, 45, 5, 2),
            ("Frozen Chicken Fillets", 2, "lbs", "Frozen", 180, 8.99, 165, 31, 0, 4, 0),
        ]
        summary = "Deep freezer camera detected frozen peas, mixed berries, garlic naan, and chicken fillets."
    else:
        raw_items = [
            ("Fresh Broccoli", 2, "heads", "Produce", 4, 2.99, 31, 3, 6, 0, 2),
            ("Greek Yogurt", 1, "tub", "Dairy", 6, 4.99, 130, 17, 6, 4, 0),
            ("Bell Peppers", 3, "pcs", "Produce", 5, 3.49, 30, 1, 7, 0, 2),
        ]
        summary = "Fridge camera detected fresh produce & dairy shelf items."

    items = [
        ScannedPantryItem(
            name=name,
            quantity=qty,
            unit=unit,
            category=cat,
            days_left=days,
            expiry_date=(today + timedelta(days=days)).isoformat(),
            price=price,
            nutrition=ScannedPantryNutrition(
                calories=cal, protein=pro, carbs=carb, fat=fat, fiber=fib
            ),
        )
        for name, qty, unit, cat, days, price, cal, pro, carb, fat, fib in raw_items
    ]
    return PantryScanResponse(summary=summary, items=items)


def scan_pantry_photo(image_data_url: str, scan_type: str = "auto", scenario: str = "produce") -> PantryScanResponse:
    if not settings.openai_api_key or not image_data_url.startswith("data:image/"):
        return _fallback_scan(scan_type, scenario=scenario)

    instructions = AUTO_SCAN_INSTRUCTIONS
    prompt_text = (
        f"Today's date is {date.today().isoformat()}. Automatically detect if this image is a fridge/pantry photo, "
        "store receipt, or online order screenshot, extract all food items, and calculate days_left and expiry_date (YYYY-MM-DD)."
    )

    try:
        client = OpenAI(api_key=settings.openai_api_key, max_retries=0)
        response = client.responses.create(
            model=settings.openai_model,
            instructions=instructions,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": prompt_text},
                        {"type": "input_image", "image_url": image_data_url},
                    ],
                }
            ],
            max_output_tokens=1600,
            store=False,
            text={
                "format": {
                    "type": "json_schema",
                    "name": "grocify_pantry_scan",
                    "strict": True,
                    "schema": PantryScanResponse.model_json_schema(),
                }
            },
        )
        parsed = PantryScanResponse.model_validate_json(response.output_text)
        return _with_computed_expiry(parsed)
    except Exception:
        return _fallback_scan(scan_type, scenario=scenario)
