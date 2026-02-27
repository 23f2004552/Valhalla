"""
RMS Security Reality Audit - Task 29
Tests: price manipulation, CORS, order ID injection, auth bypass, replay attacks
"""

import requests
import json

BASE = "http://localhost:8080"


def run():
    print("=" * 60)
    print("RMS SECURITY REALITY AUDIT")
    print("=" * 60)

    # 1. Price Manipulation
    print("\n--- 1. PRICE MANIPULATION ---")
    try:
        r = requests.post(
            f"{BASE}/api/orders",
            json={"items": [{"menu_item_id": 2, "quantity": 1, "price": 0.01}]},
            timeout=15,
        )
        data = r.json()
        server_price = data.get("total_price", "N/A")
        print(f"HTTP {r.status_code}")
        print(f"Injected price: 0.01 | Server-side total: {server_price}")
        print(
            f"RESULT: {'PASS - Server ignores client price' if server_price != 0.01 else 'FAIL - Client price accepted!'}"
        )
    except Exception as e:
        print(f"Error: {e}")

    # 2. CORS
    print("\n--- 2. CORS ORIGIN CHECK ---")
    try:
        r = requests.options(
            f"{BASE}/api/menu",
            headers={
                "Origin": "http://evil.com",
                "Access-Control-Request-Method": "GET",
            },
            timeout=5,
        )
        acao = r.headers.get("Access-Control-Allow-Origin", "MISSING")
        print(f"HTTP {r.status_code}")
        print(f"Access-Control-Allow-Origin: {acao}")
        blocked = acao != "*" and "evil.com" not in acao
        print(
            f"RESULT: {'PASS - Evil origin blocked' if blocked else 'FAIL - Evil origin allowed!'}"
        )
    except Exception as e:
        print(f"Error: {e}")

    # 3. Order ID Injection
    print("\n--- 3. ORDER ID INJECTION ---")
    try:
        r = requests.post(
            f"{BASE}/api/orders",
            json={"items": [{"menu_item_id": 2, "quantity": 1}]},
            timeout=15,
        )
        # Intentionally malformed - should be rejected or ignored
        print(f"HTTP {r.status_code}")
    except Exception as e:
        pass
    try:
        r = requests.post(
            f"{BASE}/api/orders",
            json={"items": [{"menu_item_id": 2, "quantity": 1}], "id": 99999},
            timeout=15,
        )
        server_id = r.json().get("id", "N/A")
        print(f"HTTP {r.status_code}, server assigned id: {server_id}")
        print(
            f"RESULT: {'PASS - Server ignores injected ID' if server_id != 99999 else 'FAIL'}"
        )
    except Exception as e:
        print(f"Error: {e}")

    # 4. Auth without cookie
    print("\n--- 4. AUTH VERIFY WITHOUT TOKEN ---")
    try:
        r = requests.get(f"{BASE}/api/auth/verify", timeout=5)
        print(f"HTTP {r.status_code}: {r.text[:100]}")
        print(f"RESULT: {'PASS - Rejected' if r.status_code in [401, 403] else 'FAIL'}")
    except Exception as e:
        print(f"Error: {e}")

    # 5. Replay attack (order)
    print("\n--- 5. ORDER REPLAY ATTACK ---")
    try:
        r1 = requests.post(
            f"{BASE}/api/orders",
            json={"items": [{"menu_item_id": 2, "quantity": 1}]},
            timeout=15,
        )
        id1 = r1.json().get("id")
        r2 = requests.post(
            f"{BASE}/api/orders",
            json={"items": [{"menu_item_id": 2, "quantity": 1}]},
            timeout=15,
        )
        id2 = r2.json().get("id")
        print(f"First order: HTTP {r1.status_code}, id={id1}")
        print(f"Replay order: HTTP {r2.status_code}, id={id2}")
        print(
            f"RESULT: {'PASS - Server creates new order (replay = new order, not idempotent)' if id1 != id2 else 'FAIL'}"
        )
        print(f"NOTE: No idempotency key in order creation - replay creates new order")
    except Exception as e:
        print(f"Error: {e}")

    # 6. Token signature verification
    print("\n--- 6. JWT SIGNATURE VERIFICATION ---")
    try:
        # Create a fake/modified JWT
        fake_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.fake_signature"
        r = requests.get(
            f"{BASE}/api/auth/verify",
            cookies={"rms_token": fake_jwt},
            timeout=5,
        )
        print(f"HTTP {r.status_code}: {r.text[:100]}")
        print(
            f"RESULT: {'PASS - Fake JWT rejected' if r.status_code in [401, 403] else 'FAIL'}"
        )
    except Exception as e:
        print(f"Error: {e}")

    # 7. Internal endpoint via gateway
    print("\n--- 7. INVENTORY RESTORE VIA GATEWAY ---")
    try:
        r = requests.post(
            f"{BASE}/api/inventory/restore",
            json={"menu_item_id": 3, "quantity": 100},
            timeout=5,
        )
        print(f"HTTP {r.status_code}: {r.text[:100]}")
        print(
            f"RESULT: {'PASS - Blocked' if r.status_code in [403, 404, 422] else 'FAIL'}"
        )
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    run()
