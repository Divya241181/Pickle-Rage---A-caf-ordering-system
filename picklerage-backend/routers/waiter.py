from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

class WaiterCallCreate(BaseModel):
    session_id: str
    call_type: str

router = APIRouter()

@router.post("/")
def create_waiter_call(call: WaiterCallCreate):
    if call.call_type not in ["water", "new_order", "bill"]:
        raise HTTPException(status_code=400, detail="Invalid call type")
        
    new_call = supabase.table("waiter_calls").insert({
        "session_id": call.session_id,
        "call_type": call.call_type,
        "status": "pending"
    }).execute()
    
    if not new_call.data:
        raise HTTPException(status_code=400, detail="Failed to create call")
        
    return new_call.data[0]
