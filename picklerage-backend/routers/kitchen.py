from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

router = APIRouter()

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders")
def get_kitchen_orders():
    # Fetch orders that are not completed or cancelled, including their items
    response = supabase.table("orders").select("*, order_items(*, menu_items(name))").neq("status", "completed").neq("status", "cancelled").execute()
    
    # Group by status
    grouped = {
        "pending": [],
        "accepted": [],
        "preparing": [],
        "ready": [],
        "served": []
    }
    for order in response.data:
        status = order["status"]
        if status in grouped:
            grouped[status].append(order)
            
    return grouped

@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: str, update: OrderStatusUpdate):
    response = supabase.table("orders").update({"status": update.status}).eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return response.data[0]
