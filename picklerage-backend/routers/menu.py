from fastapi import APIRouter, HTTPException
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
