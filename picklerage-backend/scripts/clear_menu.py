"""
Clear Menu Script
Usage: python scripts/clear_menu.py

This script deletes all categories and menu items from the Supabase database.
It will ask for confirmation before executing the deletion.
"""

import os
import sys

# Add the parent directory to the Python path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase

def main():
    confirmation = input("Are you sure you want to delete all menu data? (yes/no): ")
    if confirmation.lower() != "yes":
        print("Operation cancelled.")
        return
        
    print("Deleting menu items...")
    # Using neq id with a dummy UUID to match and delete all records
    supabase.table("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    
    print("Deleting categories...")
    supabase.table("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    
    print("Successfully cleared all menu data.")

if __name__ == "__main__":
    main()
