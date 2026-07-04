from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionCreate(BaseModel):
    table_id: str
    customer_name: str
    mobile: str
    guest_count: int

class SessionResponse(BaseModel):
    id: str
    table_id: str
    customer_name: str
    mobile: str
    guest_count: int
    status: str
    started_at: datetime
