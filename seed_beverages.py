import urllib.request
import json

API_URL = "https://valhalla-menu.onrender.com/menu"
CAT_URL = "https://valhalla-menu.onrender.com/categories"

# 1. Create Beverages Category
cat_id = 5
try:
    req = urllib.request.Request(CAT_URL, data=json.dumps({"name": "Beverages"}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    cat_id = data['id']
    print(f"Created Beverages category with ID {cat_id}")
except Exception as e:
    print(f"Category creation failed (might already exist): {e}")
    # Fetch existing categories to get the right ID
    res = urllib.request.urlopen(CAT_URL)
    categories = json.loads(res.read())
    for c in categories:
        if c['name'].lower() == 'beverages':
            cat_id = c['id']
            print(f"Found Beverages category with ID {cat_id}")

# 2. Add Beverages
beverages = [
    {"name": "Mineral Water", "price": 20, "description": "1L bottled purified water.", "category_id": cat_id, "image_url": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e"},
    {"name": "Soft Drinks", "price": 40, "description": "Choice of cola, lemon, or orange soda.", "category_id": cat_id, "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97"},
    {"name": "Masala Chai", "price": 30, "description": "Hot Indian tea brewed with milk and aromatic spices.", "category_id": cat_id, "image_url": "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8"},
    {"name": "Sweet Lassi", "price": 60, "description": "Traditional sweet yogurt-based drink.", "category_id": cat_id, "image_url": "https://images.unsplash.com/photo-1546833998-877b37c2e5c6"},
    {"name": "Salted Lassi", "price": 60, "description": "Refreshing salted yogurt drink with roasted cumin.", "category_id": cat_id, "image_url": "https://images.unsplash.com/photo-1546833998-877b37c2e5c6"},
]

success = 0
for item in beverages:
    req = urllib.request.Request(API_URL, data=json.dumps(item).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        urllib.request.urlopen(req)
        success += 1
        print(f"Added {item['name']}")
    except Exception as e:
        print(f"Failed {item['name']}: {e}")

print(f"\nSuccessfully added {success}/{len(beverages)} beverages.")
