import sys
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]
if str(APP_ROOT) not in sys.path:
    sys.path.insert(0, str(APP_ROOT))

from app.models.cart import CartItem
from app.services.barcode_lookup import lookup_barcode
from app.services.nutrition_lookup import lookup_verified_nutrition
from app.services.price_compare import compare_cart_prices


def test_barcode_lookup_known_and_fallback():
    known = lookup_barcode("011110416605")
    assert known["name"] == "Organic Whole Milk"
    assert known["category"] == "Dairy"

    fallback = lookup_barcode("999999999999")
    assert fallback["barcode"] == "999999999999"
    assert fallback["quantity"] == 1


def test_nutrition_lookup_usda_reference():
    paneer = lookup_verified_nutrition("Paneer")
    assert paneer["calories"] == 265
    assert paneer["protein"] == 18.3

    spinach = lookup_verified_nutrition("Spinach")
    assert spinach["calories"] == 23


def test_price_compare_orders_stores_by_total():
    items = [CartItem(name="Lemons", quantity=2, price=2.0), CartItem(name="Milk", quantity=1, price=4.0)]
    result = compare_cart_prices(items)
    assert result["base_cart_total"] == 8.0
    assert result["best_store"] == "Aldi / Budget Mart"
    assert result["potential_savings"] > 0
    totals = [s["estimated_total"] for s in result["stores"]]
    assert totals == sorted(totals)
