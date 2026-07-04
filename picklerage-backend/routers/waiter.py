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

@router.get("/calls")
def get_waiter_calls():
    # Fetch pending waiter calls with session and table info
    response = supabase.table("waiter_calls").select("*, table_sessions(customer_name, tables(table_number))").eq("status", "pending").execute()
    return response.data

@router.patch("/calls/{call_id}/acknowledge")
def acknowledge_waiter_call(call_id: str):
    response = supabase.table("waiter_calls").update({"status": "acknowledged"}).eq("id", call_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Call not found")
    return response.data[0]
