import requests
import time
import sys
import psycopg2
import concurrent.futures

# Config
API_URL = "http://localhost:8080/api"
DB_CONN_ORDER = (
    "dbname=orderdb user=postgres password=password host=127.0.0.1 port=5432"
)
DB_CONN_INVENTORY = (
    "dbname=inventorydb user=postgres password=password host=127.0.0.1 port=5432"
)
DB_CONN_PAYMENT = (
    "dbname=paymentdb user=postgres password=password host=127.0.0.1 port=5432"
)


def wait_for_service():
    print("Waiting for API...")
    for _ in range(30):
        try:
            if requests.get(f"{API_URL}/menu").status_code == 200:
                return True
        except:
            pass
        time.sleep(2)
    return False


def run_test():
    if not wait_for_service():
        print("❌ API failed to start")
        sys.exit(1)

    print(">>> 1. Creating Order...")
    try:
        wait_for_service()

        # --- 0. READ INITIAL STATE ---
        print("\n>>> 0. Reading Initial Stock...")
        conn = psycopg2.connect(DB_CONN_INVENTORY)
        cur = conn.cursor()
        cur.execute("SELECT current_stock FROM ingredients WHERE id = 1")  # Saffron
        initial_stock = cur.fetchone()[0]
        conn.close()
        print(f"   ℹ️ Initial Stock for Saffron (ID 1): {initial_stock}")

        # --- 1. SUCCESSFUL ORDER ---
        print("\n>>> 1. Creating Order (Success Case)...")
        # Saffron Risotto (ID 1) uses 2 units of Saffron
        order_payload = {"items": [{"menu_item_id": 1, "quantity": 1}]}

        resp = requests.post(f"{API_URL}/orders", json=order_payload)
        if resp.status_code != 201:
            print(f"❌ Order Creation Failed: {resp.status_code} - {resp.text}")
        resp.raise_for_status()
        order = resp.json()
        print(f"✅ Order Created: ID {order['id']}, Status: {order['status']}")

        order_id = order["id"]

        # Verify Deduction
        conn = psycopg2.connect(DB_CONN_INVENTORY)
        cur = conn.cursor()
        cur.execute("SELECT current_stock FROM ingredients WHERE id = 1")
        stock_after_order_1 = cur.fetchone()[0]
        conn.close()

        expected_stock_1 = initial_stock - 2
        print(f"   ℹ️ Stock: {stock_after_order_1} (Expected: {expected_stock_1})")
        if stock_after_order_1 != expected_stock_1:
            print(
                f"❌ Stock verification failed! Expected {expected_stock_1}, Got {stock_after_order_1}"
            )
            sys.exit(1)
        print("✅ Inventory Correctly Deducted (Success Case)")

        # --- 2. PAYMENT FAILURE & ROLLBACK ---
        print("\n>>> 2. Testing Payment Failure & Rollback...")
        # Chaos Crunch (ID 99) uses 100 units of Saffron and costs 999.00
        # This MUST fail payment and rollback inventory.
        fail_payload = {"items": [{"menu_item_id": 99, "quantity": 1}]}

        resp = requests.post(f"{API_URL}/orders", json=fail_payload)
        if resp.status_code == 201:
            print("❌ FATAL: Order succeeded but should have FAILED payment (999.00)")
            sys.exit(1)

        # Expect 402 or 400 depending on service mapping
        # Payment service returns 402 for FAILED. Order service might propagate or wrap.
        print(f"   ℹ️ Received Expected Error: {resp.status_code} (Expect ~402/500)")

        # Verify Stock DID NOT CHANGE from stock_after_order_1
        conn = psycopg2.connect(DB_CONN_INVENTORY)
        cur = conn.cursor()
        cur.execute("SELECT current_stock FROM ingredients WHERE id = 1")
        stock_after_fail = cur.fetchone()[0]
        conn.close()

        print(f"   ℹ️ Stock: {stock_after_fail} (Expected: {stock_after_order_1})")
        if stock_after_fail != stock_after_order_1:
            print(f"❌ ROLLBACK FAILED! Stock changed despite payment failure.")
            sys.exit(1)
        print("✅ Inventory Rollback Verified (Stock unchanged after failure)")

        # --- 3. CONCURRENCY ---
        print("\n>>> 3. Testing Concurrency (5 concurrent orders)...")
        # 5 x Saffron Risotto = 5 * 2 = 10 units

        def place_order(i):
            p = {"items": [{"menu_item_id": 1, "quantity": 1}]}
            try:
                r = requests.post(f"{API_URL}/orders", json=p)
                return r.status_code, r.json()
            except Exception as e:
                return 0, str(e)

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(place_order, i) for i in range(5)]
            results = [f.result() for f in futures]

        success_count = sum(1 for status, _ in results if status == 201)
        print(f"✅ Concurrent Orders Placed: {success_count}/5")

        if success_count < 5:
            print("⚠️ Some concurrent orders failed (unexpected)")

        # Verify Final Stock
        conn = psycopg2.connect(DB_CONN_INVENTORY)
        cur = conn.cursor()
        cur.execute("SELECT current_stock FROM ingredients WHERE id = 1")
        final_stock = cur.fetchone()[0]
        conn.close()

        expected_final = stock_after_order_1 - (5 * 2)
        print(f"✅ Final Stock: {final_stock} (Expected: {expected_final})")

        if final_stock != expected_final:
            print(
                f"❌ Inventory Mismatch! Start: {stock_after_order_1}, Consumed: 10, End: {final_stock}"
            )
            sys.exit(1)

        print("\n🎉 ENTERPRISE VALIDATION PASSED (Deterministic & Dynamic)")
        sys.exit(0)

    except Exception as e:
        print(f"❌ Test Failed: {e}")
        if hasattr(e, "response") and e.response:
            print(e.response.text)
        sys.exit(1)


if __name__ == "__main__":
    run_test()
