import os

base_dir = r'd:\Projects\Pickel Rage\picklerage-backend'

# SCHEMAS
menu_schema = '''from pydantic import BaseModel
from typing import List, Optional

class MenuItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    food_type: str
    is_available: bool
    is_popular: bool

class Category(BaseModel):
    id: str
    name: str
    sort_order: int
    items: List[MenuItem] = []

class MenuResponse(BaseModel):
    categories: List[Category]
'''
with open(os.path.join(base_dir, 'schemas', 'menu.py'), 'w') as f: f.write(menu_schema)

table_schema = '''from pydantic import BaseModel

class TableVerifyResponse(BaseModel):
    table_id: str
    table_number: int
    status: str
'''
with open(os.path.join(base_dir, 'schemas', 'table.py'), 'w') as f: f.write(table_schema)

session_schema = '''from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionCreate(BaseModel):
    table_id: str
    customer_name: str
    mobile: str
    guest_count: int

class SessionResponse(BaseModel):
    id: str
    table_id: str
    customer_name: str
    mobile: str
    guest_count: int
    status: str
    started_at: datetime
'''
with open(os.path.join(base_dir, 'schemas', 'session.py'), 'w') as f: f.write(session_schema)

order_schema = '''from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int

class OrderCreate(BaseModel):
    session_id: Optional[str] = None
    order_type: str
    customer_name: Optional[str] = None
    mobile: Optional[str] = None
    items: List[OrderItemCreate]
'''
with open(os.path.join(base_dir, 'schemas', 'order.py'), 'w') as f: f.write(order_schema)


# ROUTERS
menu_router = '''from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.menu import MenuResponse, Category, MenuItem

router = APIRouter()

@router.get("/", response_model=MenuResponse)
def get_menu():
    cat_response = supabase.table("categories").select("*").order("sort_order").execute()
    categories = cat_response.data
    
    items_response = supabase.table("menu_items").select("*").eq("is_available", True).execute()
    items = items_response.data
    
    cat_map = {}
    for cat in categories:
        cat_map[cat['id']] = {
            "id": cat['id'],
            "name": cat['name'],
            "sort_order": cat['sort_order'],
            "items": []
        }
        
    for item in items:
        if item['category_id'] in cat_map:
            cat_map[item['category_id']]['items'].append(item)
            
    return MenuResponse(categories=list(cat_map.values()))
'''
with open(os.path.join(base_dir, 'routers', 'menu.py'), 'w') as f: f.write(menu_router)

tables_router = '''from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.table import TableVerifyResponse

router = APIRouter()

@router.get("/verify", response_model=TableVerifyResponse)
def verify_table(token: str):
    response = supabase.table("tables").select("*").eq("qr_token", token).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Table not found")
    table = response.data[0]
    return TableVerifyResponse(
        table_id=table["id"],
        table_number=table["table_number"],
        status=table["status"]
    )
'''
with open(os.path.join(base_dir, 'routers', 'tables.py'), 'w') as f: f.write(tables_router)

sessions_router = '''from fastapi import APIRouter, HTTPException
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
'''
with open(os.path.join(base_dir, 'routers', 'sessions.py'), 'w') as f: f.write(sessions_router)

orders_router = '''from fastapi import APIRouter, HTTPException
from database import supabase
from schemas.order import OrderCreate

router = APIRouter()

@router.post("/")
def create_order(order: OrderCreate):
    menu_item_ids = [i.menu_item_id for i in order.items]
    if not menu_item_ids:
        raise HTTPException(status_code=400, detail="Order must have items")
        
    menu_items = supabase.table("menu_items").select("id, price").in_("id", menu_item_ids).execute()
    price_map = {item["id"]: item["price"] for item in menu_items.data}
    
    total = sum(i.quantity * price_map.get(i.menu_item_id, 0) for i in order.items)
    
    round_number = 1
    if order.order_type == "dine_in" and order.session_id:
        existing_orders = supabase.table("orders").select("id").eq("session_id", order.session_id).execute()
        round_number = len(existing_orders.data) + 1
        
    new_order = supabase.table("orders").insert({
        "session_id": order.session_id,
        "order_type": order.order_type,
        "customer_name": order.customer_name,
        "mobile": order.mobile,
        "round_number": round_number,
        "total": total,
        "status": "pending"
    }).execute()
    
    if not new_order.data:
        raise HTTPException(status_code=400, detail="Failed to create order")
        
    order_id = new_order.data[0]["id"]
    
    order_items_data = []
    for item in order.items:
        order_items_data.append({
            "order_id": order_id,
            "menu_item_id": item.menu_item_id,
            "quantity": item.quantity,
            "unit_price": price_map.get(item.menu_item_id, 0)
        })
        
    supabase.table("order_items").insert(order_items_data).execute()
    
    return {"order": new_order.data[0], "items": order_items_data}

@router.get("/{order_id}/status")
def get_order_status(order_id: str):
    order = supabase.table("orders").select("*").eq("id", order_id).execute()
    if not order.data:
        raise HTTPException(status_code=404, detail="Order not found")
        
    items = supabase.table("order_items").select("*, menu_items(name)").eq("order_id", order_id).execute()
    
    data = order.data[0]
    data["items"] = items.data
    return data
'''
with open(os.path.join(base_dir, 'routers', 'orders.py'), 'w') as f: f.write(orders_router)

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
'''
with open(os.path.join(base_dir, 'routers', 'waiter.py'), 'w') as f: f.write(waiter_router)
print('Step 3 schemas and routers written.')
