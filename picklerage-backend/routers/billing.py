from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.payment import PaymentCreate, PaymentResponse
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta

class OrderStatusUpdate(BaseModel):
    status: str

router = APIRouter()

def process_order_completion(order_id: str):
    order_response = supabase.table("orders").update({"status": "completed"}).eq("id", order_id).execute()
    if not order_response.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = order_response.data[0]
    
    if order.get("order_type") == "dine_in" and order.get("session_id"):
        session_id = order["session_id"]
        uncompleted = supabase.table("orders").select("id").eq("session_id", session_id).neq("status", "completed").neq("status", "cancelled").execute()
        
        if not uncompleted.data:
            supabase.table("table_sessions").update({"status": "closed", "closed_at": datetime.utcnow().isoformat()}).eq("id", session_id).execute()
            session = supabase.table("table_sessions").select("table_id").eq("id", session_id).execute()
            if session.data:
                table_id = session.data[0]["table_id"]
                supabase.table("tables").update({"status": "available"}).eq("id", table_id).execute()
                
    return order

@router.get("/orders")
def get_billing_orders():
    # Today midnight
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    response = supabase.table("orders").select("*, table_sessions(tables(table_number)), payments(*), order_items(*, menu_items(name))").gte("created_at", today).order("created_at", desc=True).execute()
    
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    formatted_orders = []
    
    for order in response.data:
        created_at = datetime.fromisoformat(order["created_at"].replace("Z", "+00:00"))
        elapsed_seconds = int((now - created_at).total_seconds())
        
        table_number = None
        if order.get("table_sessions") and order["table_sessions"].get("tables"):
            table_number = order["table_sessions"]["tables"]["table_number"]
            
        payment = None
        if order.get("payments"):
            payment = order["payments"][0] # take the first payment record
            
        formatted_items = []
        for item in order.get("order_items", []):
            formatted_items.append({
                "name": item["menu_items"]["name"] if item.get("menu_items") else "Unknown",
                "quantity": item["quantity"],
                "unit_price": item["unit_price"]
            })
            
        formatted_orders.append({
            "id": order["id"],
            "session_id": order.get("session_id"),
            "order_type": order["order_type"],
            "table_number": table_number,
            "customer_name": order["customer_name"],
            "mobile": order["mobile"],
            "round_number": order["round_number"],
            "total": order["total"],
            "status": order["status"],
            "payment": payment,
            "items": formatted_items,
            "created_at": order["created_at"],
            "elapsed_seconds": elapsed_seconds
        })
        
    return formatted_orders

@router.post("/{order_id}/payment")
def record_payment(order_id: str, payment: PaymentCreate):
    payment_res = supabase.table("payments").insert({
        "order_id": order_id,
        "method": payment.method,
        "amount": payment.amount
    }).execute()
    
    if not payment_res.data:
        raise HTTPException(status_code=400, detail="Failed to record payment")
        
    order = process_order_completion(order_id)
    return {"order": order, "payment": payment_res.data[0]}

@router.patch("/{order_id}/complete")
def complete_order(order_id: str):
    order = process_order_completion(order_id)
    return {"message": "Order marked as completed", "order": order}

@router.patch("/orders/{order_id}/status")
def update_billing_status(order_id: str, payload: OrderStatusUpdate):
    # Fetch current order to check status
    order_res = supabase.table("orders").select("status").eq("id", order_id).execute()
    if not order_res.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    current_status = order_res.data[0]["status"]
    new_status = payload.status
    
    # Enforce valid transitions
    if (current_status == "ready" and new_status == "served") or \
       (current_status == "served" and new_status == "completed"):
        if new_status == "completed":
            return complete_order(order_id)
        else:
            updated = supabase.table("orders").update({"status": new_status}).eq("id", order_id).execute()
            return updated.data[0]
            
    raise HTTPException(status_code=400, detail="Invalid status transition")

@router.get("/stats")
def get_billing_stats():
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    response = supabase.table("orders").select("status, total, order_type, payments(id)").gte("created_at", today).execute()
    
    active = 0
    sales = 0.0
    completed = 0
    pending_pay = 0
    dine_in = 0
    takeout = 0
    
    for o in response.data:
        status = o["status"]
        if status not in ["completed", "cancelled"]:
            active += 1
        elif status == "completed":
            completed += 1
            
        if o["order_type"] == "dine_in":
            dine_in += 1
        elif o["order_type"] == "takeout":
            takeout += 1
            
        if o.get("payments"):
            sales += float(o["total"])
        elif status != "cancelled":
            pending_pay += 1
            
    return {
        "active_orders": active,
        "today_sales": sales,
        "completed_orders": completed,
        "pending_payment": pending_pay,
        "dine_in_count": dine_in,
        "takeout_count": takeout
    }
