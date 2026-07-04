import os

base_dir = r'd:\Projects\Pickel Rage\picklerage-backend'

kitchen_router = '''from fastapi import APIRouter, HTTPException
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
    
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    
    for order in response.data:
        status = order["status"]
        
        # Calculate elapsed seconds
        created_at = datetime.fromisoformat(order["created_at"].replace("Z", "+00:00"))
        elapsed_seconds = int((now - created_at).total_seconds())
        
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
'''
with open(os.path.join(base_dir, 'routers', 'kitchen.py'), 'w') as f: f.write(kitchen_router)

billing_router = '''from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.payment import PaymentCreate, PaymentResponse
from datetime import datetime, timezone, timedelta

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
'''
with open(os.path.join(base_dir, 'routers', 'billing.py'), 'w') as f: f.write(billing_router)

waiter_router = '''from fastapi import APIRouter, HTTPException
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
'''
with open(os.path.join(base_dir, 'routers', 'waiter.py'), 'w') as f: f.write(waiter_router)
print("Detailed Step 5 executed.")
