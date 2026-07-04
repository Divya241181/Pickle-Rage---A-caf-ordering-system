from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.table import TableVerifyResponse

router = APIRouter()

@router.get("/verify", response_model=TableVerifyResponse)
def verify_table(token: str):
    response = supabase.table("tables").select("*").eq("qr_token", token).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Table not found")
    table = response.data[0]
    return TableVerifyResponse(
        table_id=table["id"],
        table_number=table["table_number"],
        status=table["status"]
    )
