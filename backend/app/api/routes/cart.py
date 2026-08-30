from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.cart import CartItem
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemResponse, CartResponse


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
def list_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> CartResponse:
    items = db.scalars(select(CartItem).where(CartItem.user_id == current_user.id).order_by(CartItem.id.desc())).all()
    return CartResponse(
        cart_items=[
            CartItemResponse(id=item.id, name=item.name, quantity=item.quantity, price=item.price)
            for item in items
        ]
    )


@router.put("", response_model=CartResponse)
def replace_cart(
    cart_items: list[CartItemCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CartResponse:
    db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))
    db.add_all(
        [CartItem(user_id=current_user.id, name=item.name, quantity=item.quantity, price=item.price) for item in cart_items]
    )
    db.commit()
    return list_cart(db=db, current_user=current_user)
