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
    
    active_session = None
    session_res = supabase.table("table_sessions").select("*").eq("table_id", table["id"]).eq("status", "active").execute()
    if session_res.data:
        active_session = session_res.data[0]
        
    return TableVerifyResponse(
        table_id=table["id"],
        table_number=table["table_number"],
        status=table["status"],
        active_session=active_session
    )

@router.get("/verify/number/{table_number}", response_model=TableVerifyResponse)
def verify_table_by_number(table_number: int):
    response = supabase.table("tables").select("*").eq("table_number", table_number).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Table not found")
    table = response.data[0]
    
    active_session = None
    session_res = supabase.table("table_sessions").select("*").eq("table_id", table["id"]).eq("status", "active").execute()
    if session_res.data:
        active_session = session_res.data[0]

    return TableVerifyResponse(
        table_id=table["id"],
        table_number=table["table_number"],
        status=table["status"],
        active_session=active_session
    )
