"""
Seed Menu Script
Usage: python scripts/seed_menu.py

This script reads 'menu_data/menu.csv', checks categories and menu items
against the Supabase database, and inserts or updates them accordingly.
"""

import os
import sys
import csv

# Add the parent directory to the Python path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase

def main():
    csv_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "menu_data", "menu.csv")
    
    if not os.path.exists(csv_file_path):
        print(f"Error: Could not find {csv_file_path}")
        return

    categories_processed = 0
    items_inserted = 0
    items_updated = 0

    with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        # Cache for categories: name -> id
        category_cache = {}
        
        # Fetch existing categories to populate cache
        response = supabase.table("categories").select("id, name").execute()
        for cat in response.data:
            category_cache[cat["name"]] = cat["id"]
        
        # Fetch existing menu items: name -> item dictionary
        item_cache = {}
        response = supabase.table("menu_items").select("*").execute()
        for item in response.data:
            item_cache[item["name"]] = item

        for row in reader:
            cat_name = row["category"].strip()
            cat_sort_order = int(row["sort_order"].strip())
            item_name = row["name"].strip()
            item_desc = row["description"].strip()
            item_price = float(row["price"].strip())
            item_food_type = row["food_type"].strip()
            item_is_popular = row["is_popular"].strip().lower() == "true"
            item_is_available = row["is_available"].strip().lower() == "true"
            
            # 1. Handle Category
            if cat_name not in category_cache:
                # Insert category
                res = supabase.table("categories").insert({
                    "name": cat_name,
                    "sort_order": cat_sort_order
                }).execute()
                category_cache[cat_name] = res.data[0]["id"]
                categories_processed += 1
            
            cat_id = category_cache[cat_name]
            
            # 2. Handle Menu Item
            if item_name in item_cache:
                # Update item
                existing_item = item_cache[item_name]
                
                # Check if fields have changed
                if (float(existing_item["price"]) != item_price or
                    existing_item["description"] != item_desc or
                    existing_item["is_available"] != item_is_available or
                    existing_item["is_popular"] != item_is_popular or
                    existing_item["food_type"] != item_food_type or
                    existing_item["category_id"] != cat_id):
                    
                    supabase.table("menu_items").update({
                        "category_id": cat_id,
                        "description": item_desc,
                        "price": item_price,
                        "is_available": item_is_available,
                        "is_popular": item_is_popular,
                        "food_type": item_food_type
                    }).eq("id", existing_item["id"]).execute()
                    items_updated += 1
            else:
                # Insert item
                supabase.table("menu_items").insert({
                    "category_id": cat_id,
                    "name": item_name,
                    "description": item_desc,
                    "price": item_price,
                    "food_type": item_food_type,
                    "is_available": item_is_available,
                    "is_popular": item_is_popular
                }).execute()
                
                # add to cache to prevent duplicates from csv
                item_cache[item_name] = {
                    "id": "placeholder", # we won't need to update it again in this run
                    "name": item_name,
                    "category_id": cat_id,
                    "description": item_desc,
                    "price": item_price,
                    "is_available": item_is_available,
                    "is_popular": item_is_popular,
                    "food_type": item_food_type
                }
                items_inserted += 1
                
    print(f"Summary:")
    print(f"- Categories inserted: {categories_processed}")
    print(f"- Items inserted: {items_inserted}")
    print(f"- Items updated: {items_updated}")

if __name__ == "__main__":
    main()
