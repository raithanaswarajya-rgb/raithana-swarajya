from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field, HttpUrl


class ProductCreate(BaseModel):
    crop_name: str = Field(min_length=2, max_length=120)
    category: Literal["vegetables", "grains", "fruits", "pulses"]
    quantity: Decimal = Field(gt=0)
    unit: Literal["kg", "quintal"]
    price_per_unit: Decimal = Field(gt=0)
    location: str = Field(min_length=2, max_length=240)
    image_url: Optional[HttpUrl] = None


class ProductUpdate(BaseModel):
    price_per_unit: Optional[Decimal] = Field(default=None, gt=0)
    is_active: Optional[bool] = None


class ConversationCreate(BaseModel):
    product_id: str = Field(min_length=1)


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)
