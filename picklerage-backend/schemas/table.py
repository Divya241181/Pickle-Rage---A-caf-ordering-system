from pydantic import BaseModel
from typing import Optional, Dict, Any

class TableVerifyResponse(BaseModel):
    table_id: str
    table_number: int
    status: str
    active_session: Optional[Dict[str, Any]] = None
