import urllib.request
import json

API_URL = "https://valhalla-menu.onrender.com/menu"

items = [
    # STARTERS
    {"name": "Veg Pakora", "price": 120, "description": "Crispy mixed vegetable fritters with mint chutney.", "category_id": 1, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950"},
    {"name": "Samosa (2 pcs)", "price": 80, "description": "Classic spiced potato stuffed pastries.", "category_id": 1, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950"},
    {"name": "Paneer Tikka", "price": 220, "description": "Tandoori grilled cottage cheese marinated in yogurt and spices.", "category_id": 1, "image_url": "https://images.unsplash.com/photo-1599487405645-c172b0200877"},
    {"name": "Chicken Tikka", "price": 260, "description": "Juicy charcoal-grilled chicken chunks with aromatic spices.", "category_id": 1, "image_url": "https://images.unsplash.com/photo-1599487405645-c172b0200877"},
    {"name": "Spring Rolls", "price": 150, "description": "Crispy golden rolls stuffed with julienned vegetables.", "category_id": 1, "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999"},

    # MAIN COURSE (Veg & Non-Veg)
    {"name": "Paneer Butter Masala", "price": 240, "description": "Rich and creamy tomato gravy with soft paneer cubes.", "category_id": 2, "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641"},
    {"name": "Palak Paneer", "price": 220, "description": "Cottage cheese cubes cooked in a smooth spinach puree.", "category_id": 2, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950"},
    {"name": "Dal Makhani", "price": 200, "description": "Slow-cooked black lentils in butter and cream.", "category_id": 2, "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d"},
    {"name": "Mixed Vegetable Curry", "price": 180, "description": "Seasonal garden vegetables in a robust homestyle gravy.", "category_id": 2, "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe"},
    {"name": "Butter Chicken", "price": 280, "description": "Tandoori chicken simmered in a velvety tomato-butter sauce.", "category_id": 2, "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db"},
    {"name": "Chicken Curry", "price": 250, "description": "Traditional bone-in chicken cooked in whole Indian spices.", "category_id": 2, "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641"},
    {"name": "Chicken Masala", "price": 270, "description": "Spicy and thick chicken gravy packed with bold flavors.", "category_id": 2, "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db"},

    # BREADS
    {"name": "Tandoori Roti", "price": 30, "description": "Whole wheat flatbread baked in a clay oven.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1626074964464-f3c5fdf6cdb8"},
    {"name": "Butter Naan", "price": 50, "description": "Soft leavened flatbread glazed with butter.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1626074964464-f3c5fdf6cdb8"},
    {"name": "Garlic Naan", "price": 70, "description": "Naan bread infused with fresh garlic and coriander.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1626074964464-f3c5fdf6cdb8"},
    {"name": "Paratha", "price": 60, "description": "Flaky, multi-layered Indian flatbread.", "category_id": 3, "image_url": "https://images.unsplash.com/photo-1626074964464-f3c5fdf6cdb8"},

    # DESSERTS
    {"name": "Gulab Jamun (2 pcs)", "price": 80, "description": "Warm, deep-fried milk dumplings soaked in rose syrup.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1596560548464-f010549b84d7"},
    {"name": "Rasgulla (2 pcs)", "price": 80, "description": "Soft and spongy cheese balls in light sugar syrup.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1596560548464-f010549b84d7"},
    {"name": "Kheer", "price": 90, "description": "Creamy rice pudding enriched with cardamom and nuts.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d"},
    {"name": "Ice Cream", "price": 70, "description": "Classic vanilla bean ice cream.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1557142046-c704a3adf8f6"},
]

try:
    req = urllib.request.Request("https://valhalla-menu.onrender.com/categories", data=json.dumps({"name": "Desserts"}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    urllib.request.urlopen(req)
    print("Created Desserts category.")
except Exception as e:
    print(f"Category creation failed (might already exist): {e}")

failed_items = [
    {"name": "Gulab Jamun (2 pcs)", "price": 80, "description": "Warm, deep-fried milk dumplings soaked in rose syrup.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1596560548464-f010549b84d7"},
    {"name": "Rasgulla (2 pcs)", "price": 80, "description": "Soft and spongy cheese balls in light sugar syrup.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1596560548464-f010549b84d7"},
    {"name": "Kheer", "price": 90, "description": "Creamy rice pudding enriched with cardamom and nuts.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d"},
    {"name": "Ice Cream", "price": 70, "description": "Classic vanilla bean ice cream.", "category_id": 4, "image_url": "https://images.unsplash.com/photo-1557142046-c704a3adf8f6"},
]

for item in failed_items:
    req = urllib.request.Request(API_URL, data=json.dumps(item).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        urllib.request.urlopen(req)
        print(f"Added {item['name']}")
    except Exception as e:
        print(f"Failed {item['name']}: {e}")
