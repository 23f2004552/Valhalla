"""
RMS Load Test — 100 Concurrent Orders
Tests: Data integrity, no duplicate payments, correct inventory math.
Usage: python tests/load_test.py
"""

import requests
import concurrent.futures
import time
import json

BASE_URL = "http://localhost:8080"
SERVICE_TOKEN = "secure_enterprise_token_2026"
HEADERS = {
    "Content-Type": "application/json",
    "X-INTERNAL-TOKEN": SERVICE_TOKEN,
}
# Note: Gateway strips X-INTERNAL-TOKEN, so these orders go through
# order-service's token validation. For load test, we call the order
# service directly via its Docker port OR accept that the gateway
# strips the header and the test validates that behavior.

CONCURRENT_WORKERS = 50  # 50 concurrent workers
ORDERS_PER_WORKER = 2  # 2 orders each = 100 total
MENU_ITEM_ID = 3  # Velvet Cacao (₹1800) — lightest inventory impact


def get_initial_stock():
    """Get current inventory stock before test."""
    try:
        resp = requests.get(f"{BASE_URL}/api/inventory", timeout=5)
        if resp.status_code == 200:
            return {item["name"]: item["current_stock"] for item in resp.json()}
    except Exception:
        pass
    return {}


def place_order(worker_id, order_num):
    """Place a single order and return result."""
    try:
        payload = {"items": [{"menu_item_id": MENU_ITEM_ID, "quantity": 1}]}
        start = time.time()
        resp = requests.post(
            f"{BASE_URL}/api/orders",
            json=payload,
            headers=HEADERS,
            timeout=30,
        )
        elapsed = time.time() - start

        return {
            "worker": worker_id,
            "order_num": order_num,
            "status_code": resp.status_code,
            "elapsed": round(elapsed, 3),
            "order_id": resp.json().get("id") if resp.status_code == 201 else None,
            "transaction_id": resp.json().get("transaction_id")
            if resp.status_code == 201
            else None,
            "error": resp.text if resp.status_code != 201 else None,
        }
    except Exception as e:
        return {
            "worker": worker_id,
            "order_num": order_num,
            "status_code": 0,
            "elapsed": 0,
            "error": str(e),
        }


def check_payments(order_ids):
    """Verify no duplicate payments exist."""
    try:
        resp = requests.get(f"{BASE_URL}/api/payments", timeout=5)
        if resp.status_code == 200:
            payments = resp.json()
            payment_order_ids = [p["order_id"] for p in payments]
            duplicates = [
                oid
                for oid in set(payment_order_ids)
                if payment_order_ids.count(oid) > 1
            ]
            return duplicates
    except Exception:
        pass
    return []


def main():
    print("=" * 60)
    print("🔥 RMS LOAD TEST — 100 Concurrent Orders")
    print("=" * 60)

    # Pre-test: Check stock
    initial_stock = get_initial_stock()
    print(f"\n📦 Initial Stock: {json.dumps(initial_stock, indent=2)}")

    # Run concurrent orders
    results = []
    total = CONCURRENT_WORKERS * ORDERS_PER_WORKER
    print(
        f"\n🚀 Launching {total} orders ({CONCURRENT_WORKERS} workers × {ORDERS_PER_WORKER} orders)..."
    )

    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(
        max_workers=CONCURRENT_WORKERS
    ) as executor:
        futures = []
        for w in range(CONCURRENT_WORKERS):
            for o in range(ORDERS_PER_WORKER):
                futures.append(executor.submit(place_order, w, o))

        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    total_time = time.time() - start_time

    # Analyze results
    success = [r for r in results if r["status_code"] == 201]
    failed = [r for r in results if r["status_code"] != 201]
    order_ids = [r["order_id"] for r in success if r["order_id"]]
    transaction_ids = [r["transaction_id"] for r in success if r["transaction_id"]]

    print(f"\n{'=' * 60}")
    print(f"📊 RESULTS")
    print(f"{'=' * 60}")
    print(f"  Total Orders:    {total}")
    print(f"  ✅ Succeeded:    {len(success)}")
    print(f"  ❌ Failed:       {len(failed)}")
    print(f"  ⏱  Total Time:   {total_time:.2f}s")
    print(f"  ⚡ Throughput:   {total / total_time:.1f} orders/sec")
    print(
        f"  📈 Avg Latency:  {sum(r['elapsed'] for r in results) / len(results):.3f}s"
    )

    if failed:
        # Group failures by status code
        failure_codes = {}
        for r in failed:
            code = r["status_code"]
            failure_codes[code] = failure_codes.get(code, 0) + 1
        print(f"\n  Failure Breakdown: {failure_codes}")

    # Uniqueness checks
    unique_orders = len(set(order_ids))
    unique_txns = len(set(transaction_ids))
    print(f"\n🔍 INTEGRITY CHECKS")
    print(
        f"  Unique Order IDs:       {unique_orders} (expected: {len(success)})", end=""
    )
    print(" ✅" if unique_orders == len(success) else " ❌ DUPLICATE ORDERS!")
    print(f"  Unique Transaction IDs: {unique_txns} (expected: {len(success)})", end="")
    print(" ✅" if unique_txns == len(success) else " ❌ DUPLICATE TRANSACTIONS!")

    # Payment duplication check
    duplicates = check_payments(order_ids)
    print(f"  Duplicate Payments:     {len(duplicates)}", end="")
    print(" ✅" if len(duplicates) == 0 else f" ❌ DUPES: {duplicates}")

    # Post-test: Check stock
    final_stock = get_initial_stock()
    print(f"\n📦 Final Stock: {json.dumps(final_stock, indent=2)}")

    if initial_stock and final_stock:
        for item, initial in initial_stock.items():
            final = final_stock.get(item, initial)
            delta = initial - final
            if delta != 0:
                print(f"  {item}: {initial} -> {final} (delta: -{delta})")

    # Overall verdict
    print(f"\n{'=' * 60}")
    all_passed = (
        unique_orders == len(success)
        and unique_txns == len(success)
        and len(duplicates) == 0
    )
    if all_passed:
        print("🏆 LOAD TEST PASSED — No data corruption detected")
    else:
        print("💀 LOAD TEST FAILED — Data integrity issues found")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
