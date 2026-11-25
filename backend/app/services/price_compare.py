from app.models.cart import CartItem

STORE_PROFILES = [
    {"store": "Aldi / Budget Mart", "multiplier": 0.86, "note": "Lowest everyday staples pricing"},
    {"store": "Trader Joe's", "multiplier": 0.93, "note": "Best value for produce & specialty"},
    {"store": "Safeway / Local Grocer", "multiplier": 1.04, "note": "Standard regional supermarket"},
    {"store": "Whole Foods Market", "multiplier": 1.18, "note": "Organic & premium sourcing"},
]


def compare_cart_prices(cart_items: list[CartItem]) -> dict:
    """Compare estimated cart totals across regional grocery stores."""
    base_total = sum(float(item.quantity) * float(item.price) for item in cart_items)
    stores = []
    for profile in STORE_PROFILES:
        estimated_total = round(base_total * profile["multiplier"], 2)
        stores.append(
            {
                "store": profile["store"],
                "estimated_total": estimated_total,
                "note": profile["note"],
            }
        )
    stores.sort(key=lambda s: s["estimated_total"])
    best = stores[0] if stores else None
    highest = stores[-1] if stores else None
    potential_savings = round((highest["estimated_total"] - best["estimated_total"]), 2) if best and highest else 0.0
    return {
        "base_cart_total": round(base_total, 2),
        "best_store": best["store"] if best else "",
        "potential_savings": potential_savings,
        "stores": stores,
    }
