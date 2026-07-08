import os
import uuid
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('d:/Projects/Pickel Rage/picklerage-backend/.env')
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
sb = create_client(url, key)

menu_data = {
    "Thai Street Flavor": [
        {"name": "Veg Tom Yum Soup", "desc": "Lemongrass, kaffir lime, mushrooms, Thai herbs, chili paste", "price": 110.00},
        {"name": "Thai Coconut Soup (Tom Kha Style)", "desc": "Coconut milk, lemongrass, mushrooms, Thai spices", "price": 130.00},
        {"name": "Thai Basil Veg Noodles", "desc": "Rice noodles, Thai basil, vegetables, soy sauce", "price": 170.00},
        {"name": "Pad Thai Veg Noodles", "desc": "Rice noodles, tamarind sauce, vegetables, peanuts", "price": 180.00},
        {"name": "Thai Peanut Veg Noodles", "desc": "Rice noodles, peanut sauce, mixed vegetables, chili flakes", "price": 190.00},
        {"name": "Thai Basil Fried Rice", "desc": "Rice, Thai basil, vegetables, sauce, soy sauce", "price": 180.00},
        {"name": "Thai Green Curry", "desc": "Green curry paste, coconut milk, vegetables, rice (Served with Butterfly Pea Rice)", "price": 250.00},
        {"name": "Thai Red Curry", "desc": "Red curry paste, coconut milk, vegetables, rice (Served with ButterFly Pea Rice)", "price": 200.00},
    ],
    "Korean Street Kitchen": [
        {"name": "Classic Cheese Corn Dog", "desc": "Classic Korean style corn dog with cheese", "price": 150.00},
        {"name": "Spicy Chilli Corn Dog", "desc": "Corn dog batter, spicy chilli coating, cheese filling", "price": 150.00},
        {"name": "Potato Half & Half Corn Dog", "desc": "Corn dog batter, potato crust, cheese filling", "price": 160.00},
        {"name": "Crispy Crunch Corn Dog", "desc": "Corn dog batter, crispy coating, cheese filling", "price": 160.00},
        {"name": "Korean Crazy Cheesy Ramen Bowl", "desc": "Vegetable ramen broth, noodles, mixed vegetables, Cheese", "price": 220.00},
        {"name": "Korean Spicy Exotic Ramen Bowl", "desc": "Ramen broth, noodles, exotic vegetables, Chilli Oil", "price": 220.00},
        {"name": "Korean Kimchi Ramen Bowl", "desc": "Kimchi broth, ramen noodles, exotic vegetables", "price": 250.00},
        {"name": "Korean Authentic Ramen Bowl", "desc": "Rich ramen broth with noodles, tofu and exotic vegetables", "price": 250.00},
    ],
    "Chinese Favorites": [
        {"name": "Lemon Coriander Soup", "desc": "Vegetables, lemon, coriander, light broth", "price": 100.00},
        {"name": "Hot & Sour Soup", "desc": "Vegetables, soy sauce, vinegar, chilli paste", "price": 110.00},
        {"name": "Manchow Soup", "desc": "Vegetables, garlic, soy sauce, crispy noodles", "price": 110.00},
        {"name": "Veg Hakka Noodles", "desc": "Noodles, cabbage, carrot, capsicum, soy sauce", "price": 120.00},
        {"name": "Schezwan Noodles", "desc": "Noodles, vegetables, schezwan sauce", "price": 130.00},
        {"name": "Burnt Garlic Noodles", "desc": "Noodles, vegetables, burnt garlic, soy sauce", "price": 140.00},
        {"name": "Manchurian Tossed Noodles", "desc": "Noodles, vegetables, manchurian sauce", "price": 150.00},
        {"name": "Veg Fried Rice", "desc": "Rice, vegetables, soy sauce", "price": 120.00},
        {"name": "Burnt Garlic Fried Rice", "desc": "Rice, vegetables, burnt garlic", "price": 130.00},
        {"name": "Schezwan Fried Rice", "desc": "Rice, vegetables, schezwan sauce", "price": 130.00},
        {"name": "Mushroom Fried Rice", "desc": "Rice, mushrooms, vegetables", "price": 150.00},
        {"name": "Manchurian Fried Rice", "desc": "Rice, vegetables, manchurian sauce", "price": 150.00},
        {"name": "Paneer Fried Rice", "desc": "Rice, paneer cubes, vegetables", "price": 170.00},
        {"name": "Veg Manchurian Dry", "desc": "Veg manchurian balls, garlic, sauces", "price": 110.00},
        {"name": "Veg Manchurian Gravy", "desc": "Veg manchurian balls, gravy sauce", "price": 120.00},
        {"name": "Baby Corn Chilli Dry", "desc": "Baby corn, capsicum, chilli sauce", "price": 220.00},
        {"name": "Paneer Chilli Dry", "desc": "Paneer, capsicum, chilli sauce", "price": 230.00},
        {"name": "Mushroom Chilli Dry", "desc": "Mushroom, capsicum, chilli sauce", "price": 250.00},
        {"name": "Paneer Chilli Gravy", "desc": "Paneer, capsicum, gravy sauce", "price": 230.00},
        {"name": "Lotus Stem Honey Chilli Dry", "desc": "Lotus stem, honey chilli sauce", "price": 250.00},
        {"name": "Crispy Chinese Bhel", "desc": "Crispy noodles, rice, crunchy noodles, manchurian, sauces", "price": 170.00},
        {"name": "Paneer Chinese Bhel", "desc": "Paneer, noodles, rice, crispy noodles, sauces", "price": 190.00},
    ],
    "Italian Kitchen": [
        {"name": "Margherita Pizza", "desc": "Pizza dough, tomato sauce, mozzarella, basil", "price": 250.00},
        {"name": "Farm House Pizza", "desc": "Tomato sauce, mozzarella, onion, capsicum, corn, mushroom", "price": 280.00},
        {"name": "Spicy Hell Pizza", "desc": "Spicy sauce, jalapeno, chili flakes, mozzarella", "price": 280.00},
        {"name": "Four Cheese Pizza", "desc": "Mozzarella, cheddar, parmesan, processed cheese", "price": 300.00},
        {"name": "Classic Pesto Pizza", "desc": "Pesto sauce, mozzarella, vegetables", "price": 300.00},
        {"name": "Veg Exotica Pizza (Chef Special)", "desc": "Exotic vegetables, mozzarella, herbs", "price": 300.00},
        {"name": "Peri Peri Paneer Pizza", "desc": "Paneer tikka, mozzarella, onion, capsicum", "price": 300.00},
        {"name": "Cheesy Garlic Stick", "desc": "Pizza dough, garlic butter, mozzarella cheese, oregano, chilli flakes", "price": 190.00},
        {"name": "Cheesy Garlic Calzone", "desc": "Pizza dough, garlic butter, mozzarella cheese, Italian herbs, pizza sauce", "price": 250.00},
        {"name": "Cheese Corn Jalapeno Calzone", "desc": "Pizza dough, mozzarella cheese, onion, capsicum, jalapeno", "price": 250.00},
        {"name": "Red Sauce Pasta", "desc": "Penne pasta, tomato sauce, herbs", "price": 160.00},
        {"name": "Pesto Pasta", "desc": "Pesto sauce, pasta, herbs", "price": 180.00},
        {"name": "Aglio Olio Pasta", "desc": "Spaghetti, olive oil, garlic, chili flakes", "price": 180.00},
        {"name": "Alfredo Cream Pasta", "desc": "Cream sauce, butter, cheese, pasta", "price": 200.00},
        {"name": "Creamy Mushroom Pasta", "desc": "Cream sauce, mushrooms, pasta", "price": 220.00},
        {"name": "Pink Sauce Pasta", "desc": "Creamy tomato sauce, herbs, pasta", "price": 200.00},
        {"name": "Mac & Cheese Pasta", "desc": "Macaroni, cheese sauce", "price": 220.00},
        {"name": "Cheese Garlic Bread", "desc": "Bread, garlic butter, mozzarella", "price": 120.00},
        {"name": "Chilli Cheese Garlic Bread", "desc": "Bread, garlic butter, chili flakes, cheese", "price": 120.00},
        {"name": "Fresh Basil & Olive Garlic Bread", "desc": "Bread, garlic butter, basil, olives", "price": 130.00},
        {"name": "Peri Peri Cheese Garlic Bread", "desc": "Bread, peri peri seasoning, cheese", "price": 130.00},
        {"name": "Classic Tomato Bruschetta", "desc": "Toasted bread, tomato, basil, olive oil", "price": 110.00},
        {"name": "Camiso El Pirato Bruschetta", "desc": "Toasted bread, creamy cheese mix, herbs", "price": 130.00},
        {"name": "Cheesy Mint Bruschetta", "desc": "Toasted bread, mint spread, cheese", "price": 130.00},
    ],
    "Mongolian Box Selection": [
        {"name": "Mongolian Stir Fry Noodles", "desc": "Noodles, vegetables, Mongolian sauce", "price": 150.00},
        {"name": "Chilli Milli Mongolian Noodles", "desc": "Noodles, vegetables, chilli sauce", "price": 170.00},
        {"name": "Mongolian Paneer Noodles", "desc": "Noodles, paneer, vegetables, Mongolian sauce", "price": 190.00},
        {"name": "Mongolian Veg Rice Bowl", "desc": "Rice, vegetables, Mongolian sauce", "price": 150.00},
        {"name": "Mongolian Exotic Veg Rice Bowl", "desc": "Rice, exotic vegetables, Mongolian sauce", "price": 170.00},
    ],
    "Mexican Station": [
        {"name": "Mexican Bean Tacos", "desc": "Beans, salsa, lettuce, tortilla", "price": 150.00},
        {"name": "Mushroom Fajitas Tacos", "desc": "Mushroom fajitas mix, tortilla", "price": 160.00},
        {"name": "Paneer Salsa Tacos", "desc": "Paneer, salsa, tortilla", "price": 170.00},
        {"name": "Cheese Blast Taco", "desc": "Cheese filling, tortilla", "price": 170.00},
        {"name": "Corn Cheese Quesadilla", "desc": "Corn, cheese, tortilla", "price": 110.00},
        {"name": "Beans & Jalapeno Quesadilla", "desc": "Beans, jalapeno, cheese", "price": 120.00},
        {"name": "Peri Peri Quesadilla", "desc": "Peri peri seasoning, cheese", "price": 120.00},
        {"name": "Mushroom Fajitas Quesadilla", "desc": "Mushroom fajitas filling", "price": 140.00},
        {"name": "Paneer Cheese Quesadilla", "desc": "Paneer, cheese filling", "price": 140.00},
        {"name": "Beans & Salsa Burrito Bowl", "desc": "Rice, beans, salsa", "price": 250.00},
        {"name": "Paneer Salsa Burrito Bowl", "desc": "Rice, paneer, salsa", "price": 250.00},
        {"name": "Mexican Hot Pot", "desc": "Mexican gravy, vegetables", "price": 270.00},
        {"name": "Exotic Veg Burrito Bowl", "desc": "Rice, exotic vegetables", "price": 270.00},
        {"name": "Mexican Tortilla Soup", "desc": "Mexican broth, tortilla", "price": 120.00},
        {"name": "Classic Nachos", "desc": "Nachos chips, salsa", "price": 100.00},
        {"name": "Cheesy Nachos", "desc": "Nachos chips, cheese sauce", "price": 120.00},
        {"name": "Cheesy Bean Nachos", "desc": "Nachos, beans, cheese", "price": 130.00},
        {"name": "Jalapeno Olive Nachos", "desc": "Nachos, jalapeno, olives", "price": 130.00},
    ],
    "American Street Bites": [
        {"name": "Grilled Classic Veg Sandwich", "desc": "Veg sandwich filling", "price": 110.00},
        {"name": "Grilled Cheesy Cheese Sandwich", "desc": "Cheese sandwich", "price": 130.00},
        {"name": "Grilled Garlic Cheese Sandwich", "desc": "Garlic cheese filling", "price": 130.00},
        {"name": "Grilled Paneer Sandwich", "desc": "Paneer filling", "price": 140.00},
        {"name": "Veg Crispy Finger", "desc": "Crispy vegetable fingers", "price": 110.00},
        {"name": "Pizza Pocket Bite", "desc": "Pizza filling pocket", "price": 110.00},
        {"name": "Herb Cheese Ball", "desc": "Herb cheese ball", "price": 120.00},
        {"name": "Crispy Corn Nuggets", "desc": "Corn nuggets", "price": 120.00},
        {"name": "Classic Veg Burger", "desc": "Veg patty burger", "price": 90.00},
        {"name": "Smoky Peri Peri Burger", "desc": "Peri peri veg patty", "price": 110.00},
        {"name": "Cheese Signature Burger", "desc": "Cheese burger", "price": 110.00},
        {"name": "Spicy Jalapeno Burger", "desc": "Jalapeno burger", "price": 110.00},
        {"name": "Signature Loaded Burger", "desc": "Loaded burger", "price": 120.00},
        {"name": "Sea Salt Fries", "desc": "French fries sea salt", "price": 80.00},
        {"name": "Peri Peri Fries", "desc": "Peri peri fries", "price": 100.00},
        {"name": "Cheesy Fries", "desc": "Fries cheese sauce", "price": 120.00},
        {"name": "Mexican Salsa Fries", "desc": "Fries salsa", "price": 120.00},
        {"name": "Loaded Signature Fries", "desc": "Loaded fries", "price": 130.00},
        {"name": "Schezwan Veg Wrap", "desc": "Schezwan veg wrap", "price": 100.00},
        {"name": "Grilled Herb Veg Wrap", "desc": "Herb wrap", "price": 110.00},
        {"name": "Cheesy Veg Wrap", "desc": "Cheese wrap", "price": 120.00},
        {"name": "Paneer Tandoori Wrap", "desc": "Paneer tandoori wrap", "price": 120.00},
    ],
    "Desserts": [
        {"name": "Hot Brownie with Vanilla Ice Cream", "desc": "Warm brownie served with vanilla ice cream", "price": 150.00},
        {"name": "Lava Cake with Vanilla Ice Cream", "desc": "Chocolate lava cake served with vanilla ice cream", "price": 160.00},
        {"name": "Sizzling Brownie with Vanilla Ice Cream", "desc": "Hot sizzling brownie with vanilla ice cream", "price": 170.00},
        {"name": "Classic Tiramisu", "desc": "Classic coffee-flavored Italian dessert", "price": 200.00},
        {"name": "Biscoff Tiramisu", "desc": "Creamy tiramisu with biscoff flavor", "price": 220.00},
    ],
    "Water": [
        {"name": "Packed Water", "desc": "", "price": 20.00},
        {"name": "Packaged Water", "desc": "", "price": 10.00},
    ],
    "Mocktails": [
        {"name": "Blue Lagoon", "desc": "", "price": 100.00},
        {"name": "Green Apple Cooler", "desc": "", "price": 90.00},
        {"name": "Strawberry Splash", "desc": "", "price": 90.00},
        {"name": "Watermelon Cooler", "desc": "", "price": 90.00},
        {"name": "Kiwi Mint Refresher", "desc": "", "price": 100.00},
        {"name": "Passion Fruit Punch", "desc": "", "price": 100.00},
        {"name": "Orange Sunrise", "desc": "", "price": 90.00},
        {"name": "Cranberry Blast", "desc": "", "price": 100.00},
        {"name": "Lychee Sparkler", "desc": "", "price": 100.00},
    ],
    "Mojitos": [
        {"name": "Virgin Mojito", "desc": "", "price": 100.00},
        {"name": "Pineapple Mojito", "desc": "", "price": 100.00},
        {"name": "Kiwi Mojito", "desc": "", "price": 110.00},
        {"name": "Classic Mint Mojito", "desc": "", "price": 110.00},
        {"name": "Green Apple Mojito", "desc": "", "price": 110.00},
        {"name": "Strawberry Mojito", "desc": "", "price": 100.00},
        {"name": "Watermelon Mojito", "desc": "", "price": 110.00},
        {"name": "Blue Curacao Mojito", "desc": "", "price": 110.00},
        {"name": "Orange Mojito", "desc": "", "price": 100.00},
        {"name": "Cranberry Mojito", "desc": "", "price": 110.00},
        {"name": "Passion Fruit Mojito", "desc": "", "price": 110.00},
    ],
    "Refreshers & Coolers": [
        {"name": "Fresh Lime Soda", "desc": "", "price": 50.00},
        {"name": "Fresh Lime Water", "desc": "", "price": 40.00},
        {"name": "Mint Lemon Cooler", "desc": "", "price": 50.00},
        {"name": "Jaljeera Cooler", "desc": "", "price": 50.00},
        {"name": "Masala Lemonade", "desc": "", "price": 50.00},
    ],
    "Milkshakes (Vanilla Based)": [
        {"name": "Vanilla Milkshake", "desc": "", "price": 115.00},
        {"name": "Mango Milkshake", "desc": "", "price": 125.00},
        {"name": "Cold Coffee Milkshake", "desc": "", "price": 125.00},
        {"name": "Oreo Milkshake", "desc": "", "price": 145.00},
        {"name": "Butterscotch Milkshake", "desc": "", "price": 125.00},
        {"name": "Strawberry Milkshake", "desc": "", "price": 135.00},
    ],
    "Milkshakes (Chocolate Based)": [
        {"name": "Chocolate Milkshake", "desc": "", "price": 135.00},
        {"name": "Dark Chocolate Milkshake", "desc": "", "price": 145.00},
        {"name": "Chocolate Almond Milkshake", "desc": "", "price": 155.00},
        {"name": "KitKat Milkshake", "desc": "", "price": 155.00},
        {"name": "Brownie Milkshake", "desc": "", "price": 165.00},
        {"name": "Ferrero Rocher Milkshake", "desc": "", "price": 195.00},
    ],
    "Thick Shakes (Vanilla Based)": [
        {"name": "Vanilla Thick Shake", "desc": "", "price": 160.00},
        {"name": "Mango Thick Shake", "desc": "", "price": 170.00},
        {"name": "Cold Coffee Thick Shake", "desc": "", "price": 170.00},
        {"name": "Oreo Thick Shake", "desc": "", "price": 190.00},
        {"name": "Butterscotch Thick Shake", "desc": "", "price": 170.00},
        {"name": "Strawberry Thick Shake", "desc": "", "price": 180.00},
    ],
    "Thick Shakes (Chocolate Based)": [
        {"name": "Chocolate Thick Shake", "desc": "", "price": 180.00},
        {"name": "Dark Chocolate Thick Shake", "desc": "", "price": 190.00},
        {"name": "Chocolate Almond Thick Shake", "desc": "", "price": 200.00},
        {"name": "KitKat Thick Shake", "desc": "", "price": 200.00},
        {"name": "Brownie Thick Shake", "desc": "", "price": 200.00},
        {"name": "Ferrero Rocher Thick Shake", "desc": "", "price": 230.00},
    ],
    "Milk Based Tea": [
        {"name": "Regular Tea", "desc": "", "price": 30.00},
        {"name": "Masala Tea", "desc": "", "price": 40.00},
        {"name": "Ginger Tea", "desc": "", "price": 40.00},
        {"name": "Elaichi Tea", "desc": "", "price": 40.00},
        {"name": "Mint Tea", "desc": "", "price": 40.00},
        {"name": "Tulsi Tea", "desc": "", "price": 40.00},
        {"name": "Lemongrass Tea", "desc": "", "price": 40.00},
        {"name": "Jaggery Tea", "desc": "", "price": 50.00},
    ],
    "Water Based Tea": [
        {"name": "Lemon Tea", "desc": "", "price": 40.00},
        {"name": "Green Tea", "desc": "", "price": 40.00},
        {"name": "Iced Tea", "desc": "", "price": 40.00},
    ],
    "Hot Coffee": [
        {"name": "Butterscotch", "desc": "", "price": 60.00},
        {"name": "Caramel", "desc": "", "price": 60.00},
        {"name": "Coco Mocha", "desc": "", "price": 60.00},
        {"name": "Hazelnut", "desc": "", "price": 70.00},
        {"name": "Vanilla", "desc": "", "price": 70.00},
        {"name": "Hot Coffee", "desc": "", "price": 50.00},
    ],
    "Cold Coffee": [
        {"name": "Classic Cold Coffee", "desc": "", "price": 135.00},
        {"name": "Vanilla Frappe", "desc": "", "price": 145.00},
        {"name": "Coco Mocha Cold Coffee", "desc": "", "price": 145.00},
        {"name": "Caramel Cold Coffee", "desc": "", "price": 145.00},
        {"name": "Butterscotch Cold Coffee", "desc": "", "price": 155.00},
        {"name": "Hazelnut Cold Coffee", "desc": "", "price": 155.00},
    ]
}

print("Clearing old data...")
sb.table("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
sb.table("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
sb.table("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
sb.table("table_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
sb.table("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
sb.table("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

print("Inserting new categories and items...")
sort_order = 0
for cat_name, items in menu_data.items():
    sort_order += 1
    cat_res = sb.table("categories").insert({"name": cat_name, "sort_order": sort_order}).execute()
    cat_id = cat_res.data[0]["id"]
    
    items_to_insert = []
    for item in items:
        # We will use random unsplash food images based on category or name where possible
        # Or just a fallback
        query = cat_name.split()[0]
        img_url = f"https://source.unsplash.com/400x300/?{query.lower()},food"
        
        items_to_insert.append({
            "category_id": cat_id,
            "name": item["name"],
            "description": item["desc"],
            "price": item["price"],
            "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", # using a generic aesthetic food pic
            "is_available": True
        })
    sb.table("menu_items").insert(items_to_insert).execute()

print("Migration completed!")
