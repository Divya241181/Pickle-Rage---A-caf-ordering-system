from pydantic import BaseModel

class TableVerifyResponse(BaseModel):
    table_id: str
    table_number: int
    status: str
