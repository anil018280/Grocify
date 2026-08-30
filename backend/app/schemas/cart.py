from pydantic import BaseModel, Field


class CartItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    quantity: float = Field(ge=1)
    price: float = Field(ge=0)


class CartItemCreate(CartItemBase):
    pass


class CartItemResponse(CartItemBase):
    id: int


class CartResponse(BaseModel):
    cart_items: list[CartItemResponse]
