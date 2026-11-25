from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.cart import CartItem
from app.models.meal_plan import WeeklyMealPlan
from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.models.user import User
from app.schemas.cart import CartItemResponse, CartResponse
from app.schemas.meal_plan import WEEK_DAYS, MealPlanCreate, MealPlanEntry, WeeklyMealPlanResponse
from app.services.blackboard import blackboard


router = APIRouter(prefix="/meal-plan", tags=["meal plan"])


def current_week_start() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


def serialize_meal(meal: WeeklyMealPlan) -> MealPlanEntry:
    return MealPlanEntry(
        day=meal.day,
        title=meal.title,
        servings=meal.servings,
        ingredients=meal.ingredients,
        missing_ingredients=meal.missing_ingredients,
    )


@router.get("", response_model=WeeklyMealPlanResponse)
def get_weekly_meal_plan(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> WeeklyMealPlanResponse:
    week_start = current_week_start()
    meals = db.scalars(
        select(WeeklyMealPlan).where(
            WeeklyMealPlan.user_id == current_user.id,
            WeeklyMealPlan.week_start == week_start,
        )
    ).all()
    ordered_meals = sorted(meals, key=lambda meal: WEEK_DAYS.index(meal.day))
    return WeeklyMealPlanResponse(week_start=week_start, meals=[serialize_meal(meal) for meal in ordered_meals])


@router.put("/{day}", response_model=MealPlanEntry)
def schedule_meal(
    day: str,
    payload: MealPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MealPlanEntry:
    if day not in WEEK_DAYS:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Choose a valid weekday.")
    week_start = current_week_start()
    meal = db.scalar(
        select(WeeklyMealPlan).where(
            WeeklyMealPlan.user_id == current_user.id,
            WeeklyMealPlan.week_start == week_start,
            WeeklyMealPlan.day == day,
        )
    )
    ingredient_data = [ingredient.model_dump() for ingredient in payload.ingredients]
    missing_ingredients = [ingredient.name for ingredient in payload.ingredients if not ingredient.from_pantry]
    if not meal:
        meal = WeeklyMealPlan(user_id=current_user.id, week_start=week_start, day=day, title=payload.title, servings=payload.servings, ingredients=ingredient_data, missing_ingredients=missing_ingredients)
        db.add(meal)
    else:
        meal.title = payload.title
        meal.servings = payload.servings
        meal.ingredients = ingredient_data
        meal.missing_ingredients = missing_ingredients
    db.commit()
    db.refresh(meal)
    return serialize_meal(meal)


@router.delete("/{day}", status_code=status.HTTP_204_NO_CONTENT)
def remove_scheduled_meal(day: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> None:
    week_start = current_week_start()
    meal = db.scalar(select(WeeklyMealPlan).where(WeeklyMealPlan.user_id == current_user.id, WeeklyMealPlan.week_start == week_start, WeeklyMealPlan.day == day))
    if meal:
        db.delete(meal)
        db.commit()


@router.post("/{day}/missing-to-cart", response_model=CartResponse)
def add_missing_ingredients_to_cart(day: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> CartResponse:
    week_start = current_week_start()
    meal = db.scalar(select(WeeklyMealPlan).where(WeeklyMealPlan.user_id == current_user.id, WeeklyMealPlan.week_start == week_start, WeeklyMealPlan.day == day))
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No meal is scheduled for that day.")
    cart_items = db.scalars(select(CartItem).where(CartItem.user_id == current_user.id)).all()
    cart_names = {item.name.lower() for item in cart_items}
    for name in meal.missing_ingredients:
        if name.lower() not in cart_names:
            db.add(CartItem(user_id=current_user.id, name=name, quantity=1, price=0))
    db.commit()
    items = db.scalars(select(CartItem).where(CartItem.user_id == current_user.id).order_by(CartItem.id.desc())).all()
    return CartResponse(cart_items=[CartItemResponse(id=item.id, name=item.name, quantity=item.quantity, price=item.price) for item in items])


@router.post("/{day}/cook")
def mark_meal_cooked(day: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    week_start = current_week_start()
    meal = db.scalar(
        select(WeeklyMealPlan).where(
            WeeklyMealPlan.user_id == current_user.id,
            WeeklyMealPlan.week_start == week_start,
            WeeklyMealPlan.day == day,
        )
    )
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No meal is scheduled for that day.")

    pantry_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    pantry_by_name = {item.name.lower(): item for item in pantry_items}

    deducted_items: list[str] = []
    calories = 0.0
    protein = 0.0
    carbs = 0.0
    fat = 0.0
    fiber = 0.0

    for ing in meal.ingredients or []:
        if not ing.get("from_pantry"):
            continue
        match = pantry_by_name.get(str(ing.get("name", "")).strip().lower())
        if not match:
            continue
        nut = match.nutrition or {}
        calories += float(nut.get("calories", 120))
        protein += float(nut.get("protein", 5))
        carbs += float(nut.get("carbs", 15))
        fat += float(nut.get("fat", 4))
        fiber += float(nut.get("fiber", 2))
        deducted_items.append(match.name)
        match.quantity = round(float(match.quantity) - 1.0, 2)
        if match.quantity <= 0:
            db.delete(match)

    if calories == 0:
        calories, protein, carbs, fat, fiber = 360.0, 18.0, 42.0, 12.0, 6.0

    db.add(
        NutritionEntry(
            user_id=current_user.id,
            item_name=f"{meal.title} ({day})",
            servings=1.0,
            calories=round(calories, 1),
            protein=round(protein, 1),
            carbs=round(carbs, 1),
            fat=round(fat, 1),
            fiber=round(fiber, 1),
        )
    )
    title = meal.title
    db.delete(meal)
    db.commit()
    blackboard.invalidate(current_user.id, "recommendations")

    return {
        "status": "cooked",
        "day": day,
        "title": title,
        "deducted_items": deducted_items,
        "logged_calories": round(calories),
    }
