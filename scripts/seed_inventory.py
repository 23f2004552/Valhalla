import requests
import json
import sys
import os

API_URL = "http://localhost:3000/api"

# Ingredient Data: Name, Stock, Threshold
INGREDIENTS = [
    {"name": "Paneer", "current_stock": 50, "threshold": 10},
    {"name": "Chicken", "current_stock": 100, "threshold": 20},
    {"name": "Lamb", "current_stock": 40, "threshold": 10},
    {"name": "Black Lentils", "current_stock": 200, "threshold": 30},
    {"name": "Basmati Rice", "current_stock": 300, "threshold": 50},
    {"name": "Flour", "current_stock": 200, "threshold": 40},
    {"name": "Yogurt", "current_stock": 60, "threshold": 15},
    {"name": "Cream", "current_stock": 80, "threshold": 10},
    {"name": "Saffron", "current_stock": 50, "threshold": 5},
    {"name": "Truffle Oil", "current_stock": 20, "threshold": 5},
    {"name": "Spices (Mix)", "current_stock": 500, "threshold": 50},
    {"name": "Lotus Stem", "current_stock": 30, "threshold": 5},
    {"name": "Butter", "current_stock": 100, "threshold": 20},
    {"name": "Rose Water", "current_stock": 40, "threshold": 10},
]

# Mapping: Item Name -> Required Ingredients {Name: Qty}
RECIPES = {
    "Tandoori Paneer Tikka": {"Paneer": 2, "Yogurt": 1, "Spices (Mix)": 1},
    "Murgh Malai Kebab": {"Chicken": 2, "Cream": 1, "Spices (Mix)": 1},
    "Dahi Puri Sphere": {"Flour": 1, "Yogurt": 1, "Spices (Mix)": 1},
    "Saffron Lotus Stem Chips": {"Lotus Stem": 2, "Saffron": 1},
    "Dal Bukhara": {"Black Lentils": 3, "Butter": 2, "Cream": 1},
    "Kashmiri Rogan Josh": {"Lamb": 3, "Yogurt": 1, "Spices (Mix)": 2},
    "Dum Biryani Royale": {
        "Basmati Rice": 2,
        "Lamb": 2,
        "Saffron": 1,
        "Spices (Mix)": 2,
    },
    "Paneer Lababdar": {"Paneer": 2, "Cream": 1, "Butter": 1, "Spices (Mix)": 1},
    "Garlic Butter Naan": {"Flour": 2, "Butter": 1},
    "Truffle Kulcha": {"Flour": 2, "Truffle Oil": 1},
    "Saffron Pista Kulfi": {"Cream": 2, "Saffron": 1},
    "Gulab Jamun Cheesecake": {"Cream": 2, "Flour": 1, "Rose Water": 1},
    "Rose Phirni": {"Basmati Rice": 1, "Cream": 1, "Rose Water": 1},
}


def seed_inventory():
    print("=== Seeding Inventory Service ===")

    # 1. Check for `menu_map.json`
    if not os.path.exists("menu_map.json"):
        print("Error: menu_map.json not found. Run seed_menu.py first.")
        sys.exit(1)

    with open("menu_map.json", "r") as f:
        menu_map = json.load(f)

    # 2. Seed Ingredients
    ingredient_db_map = {}  # Name -> ID

    print("--> Creating Ingredients...")
    for ing in INGREDIENTS:
        resp = requests.post(f"{API_URL}/ingredients", json=ing)
        if resp.status_code == 200:
            data = resp.json()
            ingredient_db_map[data["name"]] = data["id"]
            print(f"    [OK] {ing['name']}")
        else:
            print(f"    [FAIL] {ing['name']}: {resp.text}")

    # 3. Create Mappings
    print("\n--> Mapping Recipes...")
    for item_name, ingredients in RECIPES.items():
        if item_name not in menu_map:
            print(f"    [SKIP] {item_name} not found in menu map.")
            continue

        menu_item_id = menu_map[item_name]

        for ing_name, qty in ingredients.items():
            if ing_name not in ingredient_db_map:
                print(f"    [ERR] Ingredient {ing_name} not found in DB.")
                continue

            ing_id = ingredient_db_map[ing_name]

            payload = {
                "menu_item_id": menu_item_id,
                "ingredient_id": ing_id,
                "quantity_required": qty,
            }

            resp = requests.post(f"{API_URL}/inventory/map", json=payload)
            if resp.status_code == 200:
                print(f"    [MAP] {item_name} -> {ing_name} ({qty})")
            else:
                print(f"    [FAIL] Mapping {item_name}: {resp.text}")

    print("\nInventory Seeding Complete.")


if __name__ == "__main__":
    seed_inventory()
