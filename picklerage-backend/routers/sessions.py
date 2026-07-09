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

@router.get("/{session_id}/status")
def get_session_status(session_id: str):
    session = supabase.table("table_sessions").select("id, status, table_id, closed_at, tables(table_number)").eq("id", session_id).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")
        
    s = session.data[0]
    return {
        "session_id": s["id"],
        "status": s["status"],
        "table_number": s["tables"]["table_number"] if s.get("tables") else None,
        "closed_at": s["closed_at"]
    }
