import requests
import json

MENU_SERVICE_URL = "http://localhost:8080/api"

# Drink Data
drinks = [
    {
        "name": "Mango Lassi",
        "description": "Creamy yogurt drink blended with Alphonso mango pulp.",
        "price": 250.0,
        "category": "Drinks",
        "img": "https://images.unsplash.com/photo-1626132647523-66f5bf380063?q=80&w=2000&auto=format&fit=crop",
    },
    {
        "name": "Masala Chai",
        "description": "Traditional Indian spiced tea brewed with ginger and cardamom.",
        "price": 120.0,
        "category": "Drinks",
        "img": "https://images.unsplash.com/photo-1606752000858-2947b1988880?q=80&w=2000&auto=format&fit=crop",
    },
    {
        "name": "Mumbai Mule",
        "description": "Vodka, spicy ginger beer, and a hint of tamarind.",
        "price": 850.0,
        "category": "Drinks",
        "img": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2000&auto=format&fit=crop",
    },
    {
        "name": "Thandai",
        "description": "Cold milk drink prepared with a mixture of almonds, fennel seeds, rose petals.",
        "price": 350.0,
        "category": "Drinks",
        "img": "https://images.unsplash.com/photo-1596706979603-9df2c2c019d6?q=80&w=2000&auto=format&fit=crop",
    },
]


def seed_drinks():
    print(f"Connecting to Gateway at {MENU_SERVICE_URL}...")

    # 1. Create Category: Drinks
    try:
        cat_res = requests.post(
            f"{MENU_SERVICE_URL}/categories", json={"name": "Drinks"}
        )
        if cat_res.status_code == 201:
            print("Created 'Drinks' category.")
            cat_id = cat_res.json()["id"]
        elif cat_res.status_code == 400:
            print("'Drinks' category already exists. Fetching ID...")
            # Fetch all categories to find ID
            all_cats = requests.get(f"{MENU_SERVICE_URL}/categories").json()
            cat_id = next((c["id"] for c in all_cats if c["name"] == "Drinks"), None)
        else:
            print(f"Failed to create category: {cat_res.text}")
            return
    except Exception as e:
        print(f"Connection Error: {e}")
        return

    if not cat_id:
        print("Could not resolve Category ID for Drinks.")
        return

    # 2. Add Items
    print(f"Seeding items into Category ID {cat_id}...")
    for drink in drinks:
        payload = {
            "name": drink["name"],
            "description": drink["description"],
            "price": drink["price"],
            "category_id": cat_id,
            "image_url": drink["img"],
            "is_available": True,
        }

        # Check if exists (naive check by name not implemented in API, so just try create)
        res = requests.post(f"{MENU_SERVICE_URL}/menu", json=payload)
        if res.status_code == 201:
            print(f"Added: {drink['name']}")
        else:
            print(f"Skipped/Failed {drink['name']}: {res.status_code}")


if __name__ == "__main__":
    seed_drinks()
