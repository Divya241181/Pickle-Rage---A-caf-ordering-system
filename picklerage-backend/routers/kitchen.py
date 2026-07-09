from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from database import supabase

router = APIRouter()

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders")
def get_kitchen_orders():
    # Fetch orders with status pending, accepted, preparing, ready
    response = supabase.table("orders").select("*, table_sessions(tables(table_number)), order_items(*, menu_items(name))").in_("status", ["pending", "accepted", "preparing", "ready"]).execute()
    
    grouped = {
        "pending": [],
        "accepted": [],
        "preparing": [],
        "ready": []
    }
    
    now = datetime.now(timezone.utc)
    
    for order in response.data:
        status = order["status"]
        
        # Calculate elapsed seconds
        created_at = datetime.fromisoformat(order["created_at"].replace("Z", "+00:00"))
        elapsed_seconds = max(0, int((now - created_at).total_seconds()))
        
        # Format table number
        table_number = None
        if order.get("table_sessions") and order["table_sessions"].get("tables"):
            table_number = order["table_sessions"]["tables"]["table_number"]
            
        # Format items
        formatted_items = []
        for item in order.get("order_items", []):
            formatted_items.append({
                "name": item["menu_items"]["name"] if item.get("menu_items") else "Unknown",
                "quantity": item["quantity"],
                "unit_price": item["unit_price"]
            })
            
        formatted_order = {
            "id": order["id"],
            "order_type": order["order_type"],
            "table_number": table_number,
            "customer_name": order["customer_name"],
            "round_number": order["round_number"],
            "total": order["total"],
            "status": order["status"],
            "created_at": order["created_at"],
            "elapsed_seconds": elapsed_seconds,
            "items": formatted_items
        }
        
        if status in grouped:
            grouped[status].append(formatted_order)
            
    return grouped

@router.patch("/{order_id}/status")
def update_order_status(order_id: str, update: OrderStatusUpdate):
    # Fetch current status
    order_res = supabase.table("orders").select("status").eq("id", order_id).execute()
    if not order_res.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    current_status = order_res.data[0]["status"]
    new_status = update.status
    
    valid_transitions = {
        "pending": "accepted",
        "accepted": "preparing",
        "preparing": "ready"
    }
    
    if valid_transitions.get(current_status) != new_status:
        raise HTTPException(status_code=400, detail=f"Invalid transition from {current_status} to {new_status}")
        
    updated = supabase.table("orders").update({
        "status": new_status,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", order_id).execute()
    
    return updated.data[0]
