from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.session import SessionCreate, SessionResponse

router = APIRouter()

@router.post("/", response_model=SessionResponse)
def create_session(session: SessionCreate):
    existing = supabase.table("table_sessions").select("*").eq("table_id", session.table_id).eq("status", "active").execute()
    if existing.data:
        return existing.data[0]
        
    new_session = supabase.table("table_sessions").insert({
        "table_id": session.table_id,
        "customer_name": session.customer_name,
        "mobile": session.mobile,
        "guest_count": session.guest_count,
        "status": "active"
    }).execute()
    
    if not new_session.data:
        raise HTTPException(status_code=400, detail="Failed to create session")
        
    supabase.table("tables").update({"status": "occupied"}).eq("id", session.table_id).execute()
    
    return new_session.data[0]
