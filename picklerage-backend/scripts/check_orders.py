import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('d:/Projects/Pickel Rage/picklerage-backend/.env')
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
supabase = create_client(url, key)

print("--- TABLE SESSIONS ---")
sessions = supabase.table("table_sessions").select("*").execute()
for s in sessions.data:
    print(f"Session: {s['id']}, Table: {s['table_id']}, Cust: {s['customer_name']}")

print("\n--- ORDERS ---")
orders = supabase.table("orders").select("*").execute()
for o in orders.data:
    print(f"Order: {o['id']}, Session: {o['session_id']}, Total: {o['total']}")

print("\n--- ORDER ITEMS ---")
items = supabase.table("order_items").select("*").execute()
for i in items.data:
    print(f"Item: {i['menu_item_id']}, Order: {i['order_id']}, Qty: {i['quantity']}")
