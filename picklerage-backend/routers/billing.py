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
    
    now = datetime.now(timezone.utc)
    formatted_orders = []
    
    for order in response.data:
        created_at = datetime.fromisoformat(order["created_at"].replace("Z", "+00:00"))
        elapsed_seconds = max(0, int((now - created_at).total_seconds()))
        
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

@router.get("/tables")
def get_tables():
    # 1. Get all tables
    tables_res = supabase.table("tables").select("*").order("table_number").execute()
    tables = tables_res.data
    
    # 2. Get active sessions
    sessions_res = supabase.table("table_sessions").select("*").eq("status", "active").execute()
    sessions = {s["table_id"]: s for s in sessions_res.data}
    
    # 3. For all active sessions, get orders and waiter calls
    session_ids = [s["id"] for s in sessions.values()]
    orders = []
    calls = []
    if session_ids:
        orders_res = supabase.table("orders").select("session_id, total, status").in_("session_id", session_ids).neq("status", "cancelled").execute()
        orders = orders_res.data
        
        calls_res = supabase.table("waiter_calls").select("session_id, call_type, status").in_("session_id", session_ids).eq("status", "pending").execute()
        calls = calls_res.data

    result = []
    now = datetime.now(timezone.utc)
    for t in tables:
        session = sessions.get(t["id"])
        if session:
            s_orders = [o for o in orders if o["session_id"] == session["id"]]
            s_calls = [c for c in calls if c["session_id"] == session["id"]]
            
            try:
                started_at = datetime.fromisoformat(session["started_at"].replace("Z", "+00:00"))
                elapsed_minutes = max(0, int((now - started_at).total_seconds() / 60))
            except Exception:
                elapsed_minutes = 0
            
            has_ready = any(o["status"] == "ready" for o in s_orders)
            has_bill = any(c["call_type"] == "bill" for c in s_calls)
            total = sum(o["total"] for o in s_orders)
            
            result.append({
                "table_number": t["table_number"],
                "status": "occupied",
                "session_id": session["id"],
                "customer_name": session["customer_name"],
                "session_total": total,
                "session_started_at": session["started_at"],
                "elapsed_minutes": elapsed_minutes,
                "has_ready_orders": has_ready,
                "has_bill_request": has_bill
            })
        else:
            result.append({
                "table_number": t["table_number"],
                "status": "available",
                "session_id": None,
                "customer_name": None,
                "session_total": 0,
                "session_started_at": None,
                "elapsed_minutes": 0,
                "has_ready_orders": False,
                "has_bill_request": False
            })
            
    return result
