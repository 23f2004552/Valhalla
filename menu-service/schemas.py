from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    is_available: bool = True
    image_url: Optional[str] = None
    category_id: int


class MenuItemCreate(MenuItemBase):
    pass


class MenuItem(MenuItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
