import os

base_dir = r'd:\Projects\Pickel Rage\picklerage-backend'

payment_schema = '''from pydantic import BaseModel
from datetime import datetime

class PaymentCreate(BaseModel):
    method: str
    amount: float

class PaymentResponse(BaseModel):
    id: str
    order_id: str
    method: str
    amount: float
    paid_at: datetime
'''
with open(os.path.join(base_dir, 'schemas', 'payment.py'), 'w') as f: f.write(payment_schema)

kitchen_router = '''from fastapi import APIRouter, HTTPException
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
'''
with open(os.path.join(base_dir, 'routers', 'kitchen.py'), 'w') as f: f.write(kitchen_router)

billing_router = '''from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter()

@router.get("/orders")
def get_billing_orders():
    # Fetch all orders along with any payments recorded
    response = supabase.table("orders").select("*, payments(*)").order("created_at", desc=True).execute()
    return response.data

@router.post("/orders/{order_id}/payment", response_model=PaymentResponse)
def record_payment(order_id: str, payment: PaymentCreate):
    response = supabase.table("payments").insert({
        "order_id": order_id,
        "method": payment.method,
        "amount": payment.amount
    }).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to record payment")
    return response.data[0]

@router.patch("/orders/{order_id}/complete")
def complete_order(order_id: str):
    # Update order status to completed
    order_response = supabase.table("orders").update({"status": "completed"}).eq("id", order_id).execute()
    if not order_response.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = order_response.data[0]
    
    # If dine_in, check if we need to close the session and free the table
    if order.get("order_type") == "dine_in" and order.get("session_id"):
        session_id = order["session_id"]
        
        # Check if there are other uncompleted orders in this session
        uncompleted = supabase.table("orders").select("id").eq("session_id", session_id).neq("status", "completed").neq("status", "cancelled").execute()
        
        if not uncompleted.data:
            # All orders completed, close session
            supabase.table("table_sessions").update({"status": "closed"}).eq("id", session_id).execute()
            
            # Reset table status to available
            session = supabase.table("table_sessions").select("table_id").eq("id", session_id).execute()
            if session.data:
                table_id = session.data[0]["table_id"]
                supabase.table("tables").update({"status": "available"}).eq("id", table_id).execute()
                
    return {"message": "Order marked as completed", "order": order}
'''
with open(os.path.join(base_dir, 'routers', 'billing.py'), 'w') as f: f.write(billing_router)
print("Step 5 implemented.")
