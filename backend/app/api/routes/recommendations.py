from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.nutrition import NutritionEntry
from app.models.pantry import PantryItem
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.recommendations import RecipePlan, RecipeRequest, RecommendationResponse
from app.services.recipe_generator import generate_recipe
from app.services.recommendations import build_recommendations


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> RecommendationResponse:
    pantry_items = db.scalars(select(PantryItem).where(PantryItem.user_id == current_user.id)).all()
    nutrition_entries = db.scalars(select(NutritionEntry).where(NutritionEntry.user_id == current_user.id)).all()
    calorie_target = (current_user.profile or UserProfile(user_id=current_user.id)).calorie_target
    return build_recommendations(pantry_items, nutrition_entries, calorie_target)


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
