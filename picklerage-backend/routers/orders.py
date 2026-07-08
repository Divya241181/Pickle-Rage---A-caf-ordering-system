from fastapi import APIRouter, HTTPException
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

@router.get("/session/{session_id}")
def get_session_orders(session_id: str):
    orders = supabase.table("orders").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
    if not orders.data:
        return []
        
    order_ids = [o["id"] for o in orders.data]
    items = supabase.table("order_items").select("*, menu_items(name, price)").in_("order_id", order_ids).execute()
    
    items_by_order = {}
    for item in items.data:
        if item["order_id"] not in items_by_order:
            items_by_order[item["order_id"]] = []
        items_by_order[item["order_id"]].append(item)
        
    result = []
    for o in orders.data:
        o["items"] = items_by_order.get(o["id"], [])
        result.append(o)
        
    return result
