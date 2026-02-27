import requests
import threading
import time
import sys

# Internal Docker URL
API_URL = "http://gateway:80/api"
SERVICE_TOKEN = "secure_enterprise_token_2026"


def get_menu_id(name="Tandoori Paneer Tikka"):
    try:
        resp = requests.get(f"{API_URL}/menu")
        if resp.status_code == 200:
            for item in resp.json():
                if item["name"] == name:
                    return item["id"]
    except Exception as e:
        print(f"Error fetching menu: {e}")
    return None


def get_ingredient_id(name="Paneer"):
    try:
        resp = requests.get(f"{API_URL}/inventory")
        if resp.status_code == 200:
            for ing in resp.json():
                if ing["name"] == name:
                    return ing["id"]
    except Exception as e:
        print(f"Error fetching inventory: {e}")
    return None


def set_inventory(ing_id, stock):
    print(f"Setting Ingredient {ing_id} stock to {stock}...")
    headers = {"X-INTERNAL-TOKEN": SERVICE_TOKEN}
    payload = {"name": "Paneer", "current_stock": stock, "threshold": 10}
    try:
        resp = requests.put(
            f"{API_URL}/ingredients/{ing_id}", json=payload, headers=headers
        )
        if resp.status_code == 200:
            print("  [OK] Stock updated.")
            return True
        else:
            print(f"  [FAIL] {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"  [ERR] {e}")
    return False


def place_order(menu_item_id, quantity, thread_id, results):
    print(f"[Thread-{thread_id}] Ordering Item {menu_item_id}...")
    payload = {
        "items": [{"menu_item_id": menu_item_id, "quantity": quantity}],
        "idempotency_key": f"raceinternal-test-{thread_id}-{int(time.time() * 1000)}",
    }

    try:
        start_time = time.time()
        resp = requests.post(f"{API_URL}/orders", json=payload)
        duration = time.time() - start_time

        if resp.status_code == 201:
            print(
                f"[Thread-{thread_id}] SUCCESS: ID {resp.json()['id']} ({duration:.3f}s)"
            )
            results.append("SUCCESS")
        else:
            print(f"[Thread-{thread_id}] FAILED: {resp.status_code} ({duration:.3f}s)")
            results.append("FAILED")

    except Exception as e:
        print(f"[Thread-{thread_id}] EXCEPTION: {e}")
        results.append("ERROR")


def run_stress_test():
    print("=== Internal Race Condition Stress Test ===")

    # 1. Setup
    print("Fetching IDs...")
    menu_id = get_menu_id("Tandoori Paneer Tikka")
    paneer_id = get_ingredient_id("Paneer")

    if not menu_id or not paneer_id:
        print("FAILED to find ID for Tandoori Paneer Tikka or Paneer.")
        sys.exit(1)

    print(f"Target: Item {menu_id} (Needs 2 Paneer), Ingredient {paneer_id}")

    if not set_inventory(paneer_id, 2):
        print("FAILED to set inventory.")
        sys.exit(1)

    # 2. Race
    print("\nLaunching 5 Concurrent Threads...")
    threads = []
    results = []

    for i in range(5):
        t = threading.Thread(target=place_order, args=(menu_id, 1, i, results))
        threads.append(t)

    for t in threads:
        t.start()

    for t in threads:
        t.join()

    print("\nResults:", results)
    success_count = results.count("SUCCESS")
    print(f"Total Success: {success_count} (Expected: 1)")

    if success_count == 1:
        print("✅ RACE CONDITION TEST PASSED")
    else:
        print("❌ RACE CONDITION TEST FAILED")


if __name__ == "__main__":
    run_stress_test()
