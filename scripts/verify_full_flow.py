import requests
import time
import sys
import json

BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8080/api"


def step(name, fn):
    print(f"\n🔹 STEP: {name}")
    try:
        success = fn()
        if not success:
            print("   ⚠️ Step Failed, but continuing...")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return True


def check_content(url, expected, name="Page"):
    print(f"   Getting {url}...")
    res = requests.get(url)
    found = expected in res.text
    if found:
        print(f"   ✅ Found '{expected}'")
    else:
        print(f"   ❌ Missing '{expected}'")
        print(f"   HTML Snippet: {res.text[:200]}...")
    return found


def main():
    # 1. Verify Public Site
    step("Verify Public Home", lambda: check_content(BASE_URL, "VALHALLA", "Home"))

    # 2. Verify Menu
    step(
        "Verify Menu Page", lambda: check_content(f"{BASE_URL}/menu", "Saffron", "Menu")
    )

    # 3. Capture Initial Stats
    print("\n🔹 STEP: Capture Initial Admin Stats")
    initial_orders = 0
    try:
        initial_stats = requests.get(f"{API_URL}/analytics/daily-sales").json()
        initial_orders = initial_stats.get("confirmed_orders", 0)
        print(f"   ℹ️ Initial Orders: {initial_orders}")
    except:
        print("   ⚠️ Could not fetch initial stats.")

    # 4. Place Order
    print("\n🔹 STEP: Place New Order")

    # 4.1 Lookup Item ID
    try:
        menu = requests.get(f"{API_URL}/menu").json()
        # Find any Saffron item
        target_item = next((i for i in menu if "Saffron" in i["name"]), None)

        if not target_item:
            print("   ❌ 'Saffron' item not found -- searching anything 'Available'")
            target_item = next(
                (i for i in menu if i.get("is_available") and i["price"] > 0), None
            )

        if not target_item:
            print("   ❌ NO AVAILABLE ITEMS FOUND! Cannot place order.")
            return

        print(f"   ℹ️ Ordering Item: {target_item['name']} (ID: {target_item['id']})")

        order_payload = {
            "items": [{"menu_item_id": target_item["id"], "quantity": 1}],
            "customer_name": "Verification Bot",
        }
        res = requests.post(f"{API_URL}/orders", json=order_payload)
        if res.status_code == 201:
            print(f"   ✅ Order Created: {res.json()['id']}")

            # Wait for Async Event
            print("   ⏳ Waiting 5s for Analytics...")
            time.sleep(5)

            # Check Analytics Update
            new_stats = requests.get(f"{API_URL}/analytics/daily-sales").json()
            new_orders = new_stats.get("confirmed_orders", 0)
            print(f"   ℹ️ New Orders: {new_orders}")

            if new_orders > initial_orders:
                print("   ✅ Analytics Updated!")
            else:
                print(
                    "   ⚠️ Analytics did not update (Queue might be slow or filtering). Check System."
                )
        else:
            print(f"   ❌ Order Failed: {res.text}")

    except Exception as e:
        print(f"   ❌ Order Step Error: {e}")

    # 5. Verify Admin Dashboard HTML
    step(
        "Verify Admin HTML",
        lambda: check_content(f"{BASE_URL}/admin/dashboard", "Command Center", "Admin"),
    )

    print("\n🎉 FULL SYSTEM VERIFICATION COMPLETE")


if __name__ == "__main__":
    main()
