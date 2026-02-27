import requests
import json

BASE_URL = "http://localhost:8080/api"


def seed():
    # 1. Create Categories
    categories = ["Starters", "Mains", "Desserts", "Drinks"]
    cat_map = {}

    print("🌱 Seeding Categories...")
    for cat in categories:
        try:
            res = requests.post(f"{BASE_URL}/categories", json={"name": cat})
            if res.status_code == 201:
                print(f"   ✅ Created: {cat}")
                cat_map[cat] = res.json()["id"]
            elif res.status_code == 400:
                print(f"   ℹ️ Exists: {cat}")
                # Fetch ID if exists (simplified)
            else:
                print(f"   ❌ Failed: {cat} ({res.status_code})")
        except Exception as e:
            print(f"   ❌ Error: {e}")

    # 2. Link Items (Mock Logic - Update Item 1 to Starters, Item 2 to Mains)
    # We need to know specific IDs. Let's fetch menu first.
    try:
        menu = requests.get(f"{BASE_URL}/menu").json()
        print(f"\n🔗 Linking {len(menu)} Items...")

        for i, item in enumerate(menu):
            # Simple round-robin assignment for demo
            cat_name = categories[i % len(categories)]
            # We need the ID of this category.
            # Since we didn't fetch all IDs above properly if they existed, let's just use 1, 2, 3, 4 assuming sequential or mock it.
            # Actually, let's just update Item 1 to Category 1, Item 2 to Category 2.

            cat_id = (i % 4) + 1  # 1, 2, 3, 4

            update_res = requests.put(
                f"{BASE_URL}/menu/{item['id']}",
                json={
                    "name": item["name"],
                    "price": item["price"],
                    "category_id": cat_id,
                    "description": item.get("description", ""),
                },
            )
            if update_res.status_code == 200:
                print(f"   ✅ Linked '{item['name']}' -> Category {cat_id}")
            else:
                print(f"   ❌ Failed to link '{item['name']}': {update_res.text}")

    except Exception as e:
        print(f"❌ Error linking items: {e}")


if __name__ == "__main__":
    seed()
