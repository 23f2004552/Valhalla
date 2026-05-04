import requests
import json
import sys

API_URL = "http://localhost:3000/api"

MENU_DATA = {
    "Starters": [
        {
            "name": "Tandoori Paneer Tikka",
            "description": "Cottage cheese marinated in yogurt and spices, roasted in tandoor",
            "price": 12.0,
        },
        {
            "name": "Murgh Malai Kebab",
            "description": "Creamy chicken kebabs with cardamom and mace",
            "price": 14.0,
        },
        {
            "name": "Dahi Puri Sphere",
            "description": "Semolina shells filled with spiced yogurt and tamarind gel",
            "price": 10.0,
        },
        {
            "name": "Saffron Lotus Stem Chips",
            "description": "Crispy lotus stems dusted with saffron salt",
            "price": 9.0,
        },
    ],
    "Mains": [
        {
            "name": "Dal Bukhara",
            "description": "Black lentils slow-cooked for 18 hours with butter and cream",
            "price": 18.0,
        },
        {
            "name": "Kashmiri Rogan Josh",
            "description": "Lamb braised in aromatic red gravy with Kashmiri chilies",
            "price": 22.0,
        },
        {
            "name": "Dum Biryani Royale",
            "description": "Basmati rice layered with saffron, meat, and caramelized onions",
            "price": 20.0,
        },
        {
            "name": "Paneer Lababdar",
            "description": "Cottage cheese in a rich tomato and cashew gravy",
            "price": 17.0,
        },
    ],
    "Breads": [
        {
            "name": "Garlic Butter Naan",
            "description": "Leavened bread topped with garlic and coriander",
            "price": 4.0,
        },
        {
            "name": "Truffle Kulcha",
            "description": "Stuffed bread with wild mushroom and truffle oil",
            "price": 6.0,
        },
    ],
    "Desserts": [
        {
            "name": "Saffron Pista Kulfi",
            "description": "Traditional Indian ice cream with saffron and pistachio",
            "price": 8.0,
        },
        {
            "name": "Gulab Jamun Cheesecake",
            "description": "Fusion dessert with rose-syrup soaked dumplings",
            "price": 10.0,
        },
        {
            "name": "Rose Phirni",
            "description": "Ground rice pudding flavored with rose water and cardamom",
            "price": 7.0,
        },
    ],
}


def seed_menu():
    print("=== Seeding Menu Service ===")

    # Check if API is up
    try:
        requests.get(f"{API_URL}/menu", timeout=5)
    except Exception as e:
        print(f"Error: Could not connect to {API_URL}/menu. Is Gateway running?")
        sys.exit(1)

    menu_map = {}  # Mapping Item Name -> ID

    for category_name, items in MENU_DATA.items():
        print(f"Creating Category: {category_name}")
        # 1. Create Category
        resp = requests.post(f"{API_URL}/categories", json={"name": category_name})
        if resp.status_code == 201:
            cat_data = resp.json()
            cat_id = cat_data["id"]
        elif resp.status_code == 400 and "already exists" in resp.text:
            # Find existing category ID
            print(f"  - Category exists, finding ID...")
            all_cats = requests.get(f"{API_URL}/categories").json()
            cat_id = next(
                (c["id"] for c in all_cats if c["name"] == category_name), None
            )
            if not cat_id:
                print(f"Failed to find ID for existing category {category_name}")
                continue
        else:
            print(f"Failed to create category {category_name}: {resp.text}")
            continue

        # 2. Create Items
        for item in items:
            item["category_id"] = cat_id
            print(f"  - Adding {item['name']}...")
            resp = requests.post(f"{API_URL}/menu", json=item)
            if resp.status_code == 201:
                item_data = resp.json()
                menu_map[item["name"]] = item_data["id"]
                print(f"    [OK] ID: {item_data['id']}")
            else:
                print(f"    [FAIL] {resp.text}")
                # Try to find existing ID if fail (idempotency simulation)
                all_items = requests.get(f"{API_URL}/menu").json()
                existing = next(
                    (i for i in all_items if i["name"] == item["name"]), None
                )
                if existing:
                    menu_map[item["name"]] = existing["id"]
                    print(f"    [EXISTS] ID: {existing['id']}")

    # Save map for Inventory Seeder
    with open("menu_map.json", "w") as f:
        json.dump(menu_map, f, indent=2)
    print("\nMenu Seeding Complete. Map saved to menu_map.json")


if __name__ == "__main__":
    seed_menu()
