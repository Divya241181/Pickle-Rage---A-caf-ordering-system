from pydantic import BaseModel
from typing import List, Optional

class MenuItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    food_type: str
    is_available: bool
    is_popular: bool

class Category(BaseModel):
    id: str
    name: str
    sort_order: int
    items: List[MenuItem] = []

class MenuResponse(BaseModel):
    categories: List[Category]
