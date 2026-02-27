import requests

API_URL = "http://localhost:8080/api"

# The original luxury items
ITEMS = [
    {
        "name": "Saffron & Gold Risotto",
        "price": 3200.0,
        "description": "Aged carnaroli rice, Iranian saffron, 24k gold leaf, visualised zest.",
        "category_id": 1,  # Starters (assuming ID 1 is starters)
    },
    {
        "name": "Smoked Wagyu Tartare",
        "price": 4500.0,
        "description": "A5 Japanese Wagyu, pine nut emulsion, charcoal oil, cured yolk.",
        "category_id": 1,
    },
    {
        "name": "Velvet Cacao Textures",
        "price": 1800.0,
        "description": "Single-origin dark chocolate, sea salt foam, hazelnut praline.",
        "category_id": 3,  # Desserts
    },
]


def restore():
    print("🔧 Restoring Menu Items...")
    # Fetch existing to avoid duplicates
    existing = requests.get(f"{API_URL}/menu").json()
    existing_names = {i["name"] for i in existing}

    for item in ITEMS:
        if item["name"] not in existing_names:
            print(f"   ➕ Adding {item['name']}...")
            res = requests.post(f"{API_URL}/menu", json=item)
            if res.status_code == 201:
                print("      ✅ Created")
            else:
                print(f"      ❌ Failed: {res.text}")
        else:
            print(f"   ✅ {item['name']} exists")


if __name__ == "__main__":
    restore()
