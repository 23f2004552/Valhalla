import urllib.request
import json

API_URL = "https://valhalla-menu.onrender.com/menu"

# 1. Move Breads to Category 4
res = urllib.request.urlopen(API_URL)
items = json.loads(res.read())
for item in items:
    if 'Naan' in item['name'] or 'Roti' in item['name'] or 'Paratha' in item['name']:
        item['category_id'] = 4
        # Need to format as MenuItemCreate (which means we should include all required fields)
        payload = {
            "name": item['name'],
            "price": item['price'],
            "description": item['description'],
            "category_id": item['category_id'],
            "image_url": item['image_url'],
            "is_available": item['is_available']
        }
        req = urllib.request.Request(f"{API_URL}/{item['id']}", data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PUT')
        urllib.request.urlopen(req)
        print(f"Moved {item['name']} to Breads (ID 4)")

# 2. Add Desserts with Category 3
failed_items = [
    {"name": "Gulab Jamun (2 pcs)", "price": 80, "description": "Warm, deep-fried milk dumplings soaked in rose syrup.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1596560548464-f010549b84d7"},
    {"name": "Rasgulla (2 pcs)", "price": 80, "description": "Soft and spongy cheese balls in light sugar syrup.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1596560548464-f010549b84d7"},
    {"name": "Kheer", "price": 90, "description": "Creamy rice pudding enriched with cardamom and nuts.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d"},
    {"name": "Ice Cream", "price": 70, "description": "Classic vanilla bean ice cream.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1557142046-c704a3adf8f6"},
]

for item in failed_items:
    req = urllib.request.Request(API_URL, data=json.dumps(item).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        urllib.request.urlopen(req)
        print(f"Added {item['name']} to Desserts")
    except Exception as e:
        print(f"Failed {item['name']}: {e}")
