from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int

class OrderCreate(BaseModel):
    session_id: Optional[str] = None
    order_type: str
    customer_name: Optional[str] = None
    mobile: Optional[str] = None
    items: List[OrderItemCreate]
