from pydantic import BaseModel
from datetime import datetime

class PaymentCreate(BaseModel):
    method: str
    amount: float

class PaymentResponse(BaseModel):
    id: str
    order_id: str
    method: str
    amount: float
    paid_at: datetime
