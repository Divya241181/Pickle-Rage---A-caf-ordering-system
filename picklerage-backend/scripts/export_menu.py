"""
Export Menu Script
Usage: python scripts/export_menu.py

This script fetches all current menu items from the Supabase database and
exports them to 'menu_data/menu_export.csv'.
"""

import os
import sys
import csv

# Add the parent directory to the Python path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase

def main():
    export_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "menu_data", "menu_export.csv")
    
    print("Fetching categories...")
    categories_res = supabase.table("categories").select("*").execute()
    category_map = {cat["id"]: cat for cat in categories_res.data}
    
    print("Fetching menu items...")
    items_res = supabase.table("menu_items").select("*").execute()
    items = items_res.data
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    
    with open(export_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ["category", "sort_order", "name", "description", "price", "food_type", "is_popular", "is_available"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for item in items:
            cat = category_map.get(item["category_id"])
            if not cat:
                continue
                
            writer.writerow({
                "category": cat["name"],
                "sort_order": cat["sort_order"],
                "name": item["name"],
                "description": item["description"] or "",
                "price": item["price"],
                "food_type": item["food_type"],
                "is_popular": str(item["is_popular"]).lower(),
                "is_available": str(item["is_available"]).lower()
            })
            
    print(f"Successfully exported {len(items)} items to {export_path}")

if __name__ == "__main__":
    main()
