import os
from database import supabase

def insert_test_tables():
    # Insert Tables 1 to 4
    for i in range(1, 5):
        try:
            # We ignore errors if table already exists, unique constraint on table_number
            supabase.table("tables").insert({
                "table_number": i,
                "qr_token": f"table_{i}_token"
            }).execute()
            print(f"Inserted Table {i}")
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                print(f"Table {i} already exists")
            else:
                print(f"Error inserting Table {i}: {e}")

if __name__ == "__main__":
    insert_test_tables()
