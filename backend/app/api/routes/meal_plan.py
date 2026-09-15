from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.cart import CartItem
from app.models.meal_plan import WeeklyMealPlan
from app.models.user import User
from app.schemas.cart import CartItemResponse, CartResponse
from app.schemas.meal_plan import WEEK_DAYS, MealPlanCreate, MealPlanEntry, WeeklyMealPlanResponse


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
