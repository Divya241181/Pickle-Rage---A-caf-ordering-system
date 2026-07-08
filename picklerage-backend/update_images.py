import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('d:/Projects/Pickel Rage/picklerage-backend/.env')
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
sb = create_client(url, key)

category_images = {
    "Thai Street Flavor": "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&q=80",
    "Korean Street Kitchen": "https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=500&q=80",
    "Chinese Favorites": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80",
    "Italian Kitchen": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
    "Mongolian Box Selection": "https://images.unsplash.com/photo-1543668953-b2b8004f1d46?w=500&q=80",
    "Mexican Station": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&q=80",
    "American Street Bites": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    "Desserts": "https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?w=500&q=80",
    "Water": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&q=80",
    "Mocktails": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "Mojitos": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80",
    "Refreshers & Coolers": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "Milkshakes (Vanilla Based)": "https://images.unsplash.com/photo-1572490122747-3968b75bb8ef?w=500&q=80",
    "Milkshakes (Chocolate Based)": "https://images.unsplash.com/photo-1572490122747-3968b75bb8ef?w=500&q=80",
    "Thick Shakes (Vanilla Based)": "https://images.unsplash.com/photo-1572490122747-3968b75bb8ef?w=500&q=80",
    "Thick Shakes (Chocolate Based)": "https://images.unsplash.com/photo-1572490122747-3968b75bb8ef?w=500&q=80",
    "Milk Based Tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80",
    "Water Based Tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80",
    "Hot Coffee": "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80",
    "Cold Coffee": "https://images.unsplash.com/photo-1461023058943-0708e52b5d4e?w=500&q=80"
}

print("Fetching categories...")
cats = sb.table("categories").select("*").execute().data

print("Updating menu items...")
for cat in cats:
    cat_id = cat["id"]
    cat_name = cat["name"]
    img_url = category_images.get(cat_name, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80")
    
    print(f"Updating {cat_name} items...")
    sb.table("menu_items").update({"image_url": img_url}).eq("category_id", cat_id).execute()

print("Images updated successfully!")
