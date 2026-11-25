from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.models.profile import UserProfile
from app.models.saved_recipe import SavedRecipe
from app.models.user import User
from app.schemas.recommendations import RecipePlan, RecipeRequest, RecommendationResponse
from app.services.blackboard import blackboard
from app.services.recipe_generator import generate_recipe
from app.services.recommendations import build_recommendations


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> RecommendationResponse:
    cached = blackboard.get(current_user.id, "recommendations")
    if cached:
        return RecommendationResponse.model_validate(cached)

    pantry_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    nutrition_entries = db.scalars(select(NutritionEntry).where(NutritionEntry.user_id == current_user.id)).all()
    calorie_target = (current_user.profile or UserProfile(user_id=current_user.id)).calorie_target
    result = build_recommendations(pantry_items, nutrition_entries, calorie_target)
    blackboard.put(current_user.id, "recommendations", result.model_dump(), ttl_seconds=120)
    return result


@router.post("/recipe", response_model=RecipePlan)
def create_ai_recipe(
    payload: RecipeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecipePlan:
    pantry_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    if not pantry_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Add pantry items before generating a recipe.")
    try:
        return generate_recipe(payload, pantry_items)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The AI recipe service could not generate a recipe. Please try again.") from exc


class SaveRecipeRequest(RecipePlan):
    cuisine: str = Field(default="", max_length=80)


class RateRecipeRequest(BaseModel):
    rating: int = Field(ge=1, le=5)


def _serialize_saved_recipe(recipe: SavedRecipe) -> dict:
    return {
        "id": recipe.id,
        "title": recipe.title,
        "summary": recipe.summary,
        "cuisine": recipe.cuisine,
        "prep_minutes": recipe.prep_minutes,
        "cook_minutes": recipe.cook_minutes,
        "estimated_calories_per_serving": recipe.estimated_calories_per_serving,
        "estimated_cost": recipe.estimated_cost,
        "ingredients": recipe.ingredients,
        "steps": recipe.steps,
        "substitutions": recipe.substitutions,
        "nutrition_note": recipe.nutrition_note,
        "rating": recipe.rating,
    }


@router.get("/saved")
def list_saved_recipes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    recipes = db.scalars(select(SavedRecipe).where(SavedRecipe.user_id == current_user.id).order_by(SavedRecipe.id.desc())).all()
    return {"recipes": [_serialize_saved_recipe(r) for r in recipes]}


@router.post("/saved", status_code=status.HTTP_201_CREATED)
def save_recipe(
    payload: SaveRecipeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    recipe = SavedRecipe(
        user_id=current_user.id,
        title=payload.title,
        summary=payload.summary,
        cuisine=payload.cuisine,
        prep_minutes=payload.prep_minutes,
        cook_minutes=payload.cook_minutes,
        estimated_calories_per_serving=payload.estimated_calories_per_serving,
        estimated_cost=payload.estimated_cost,
        ingredients=[ing.model_dump() for ing in payload.ingredients],
        steps=payload.steps,
        substitutions=payload.substitutions,
        nutrition_note=payload.nutrition_note,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return _serialize_saved_recipe(recipe)


@router.patch("/saved/{recipe_id}/rate")
def rate_saved_recipe(
    recipe_id: int,
    payload: RateRecipeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    recipe = db.scalar(select(SavedRecipe).where(SavedRecipe.id == recipe_id, SavedRecipe.user_id == current_user.id))
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved recipe not found.")
    recipe.rating = payload.rating
    db.commit()
    return _serialize_saved_recipe(recipe)


@router.delete("/saved/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    recipe = db.scalar(select(SavedRecipe).where(SavedRecipe.id == recipe_id, SavedRecipe.user_id == current_user.id))
    if recipe:
        db.delete(recipe)
        db.commit()
