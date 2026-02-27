"""Quick idempotency verification test"""

import requests
import uuid
import json

BASE = "http://localhost:8080/api"
key = str(uuid.uuid4())
print(f"Idempotency Key: {key}")

# Order 1
print("\n=== ORDER 1 ===")
r1 = requests.post(
    f"{BASE}/orders",
    json={"items": [{"menu_item_id": 1, "quantity": 1}]},
    headers={"X-Idempotency-Key": key},
    timeout=30,
)
print(f"Status: {r1.status_code}")
o1 = r1.json()
print(
    f"Order ID: {o1.get('id')}, Total: {o1.get('total_price')}, Key: {o1.get('idempotency_key')}"
)

# Order 2 with same key
print("\n=== ORDER 2 (SAME KEY) ===")
r2 = requests.post(
    f"{BASE}/orders",
    json={"items": [{"menu_item_id": 1, "quantity": 1}]},
    headers={"X-Idempotency-Key": key},
    timeout=30,
)
print(f"Status: {r2.status_code}")
o2 = r2.json()
print(
    f"Order ID: {o2.get('id')}, Total: {o2.get('total_price')}, Key: {o2.get('idempotency_key')}"
)

# Verify
if o1.get("id") == o2.get("id"):
    print(f"\n✅ IDEMPOTENCY PASS: Same order #{o1['id']} returned both times")
else:
    print(f"\n❌ IDEMPOTENCY FAIL: Got #{o1.get('id')} and #{o2.get('id')}")

# Order 3 with different key
print("\n=== ORDER 3 (NEW KEY) ===")
key2 = str(uuid.uuid4())
r3 = requests.post(
    f"{BASE}/orders",
    json={"items": [{"menu_item_id": 2, "quantity": 1}]},
    headers={"X-Idempotency-Key": key2},
    timeout=30,
)
print(f"Status: {r3.status_code}")
o3 = r3.json()
print(f"Order ID: {o3.get('id')}, Total: {o3.get('total_price')}")

if o3.get("id") != o1.get("id"):
    print(f"✅ NEW KEY PASS: Different order #{o3['id']} created")
else:
    print(f"❌ NEW KEY FAIL: Same order returned")
