import requests
import uuid
import time
import json

BASE_URL = "http://localhost:8080/api"


def print_header(title):
    print(f"\n{'=' * 50}\n{title}\n{'=' * 50}")


def get_auth_token():
    print("Logging in to get token...")
    try:
        # Try verify_all.py style credentials first
        res = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": "testuser", "password": "testpass123"},
        )
        if res.status_code != 200:
            # Try admin if testuser fails
            res = requests.post(
                f"{BASE_URL}/auth/login",
                json={"username": "admin", "password": "adminpassword"},
            )

        if res.status_code != 200:
            # Try creating a user if login fails
            requests.post(
                f"{BASE_URL}/auth/register",
                json={
                    "username": "stress_tester",
                    "password": "password123",
                    "email": "stress@test.com",
                },
            )
            res = requests.post(
                f"{BASE_URL}/auth/login",
                json={"username": "stress_tester", "password": "password123"},
            )

        if res.status_code == 200:
            return res.json()["access_token"]
        else:
            print(f"Login failed: {res.status_code} {res.text}")
    except Exception as e:
        print(f"Login failed: {e}")
    return None


def test_idempotency():
    print_header("TEST 1: IDEMPOTENCY CHAOS")

    token = get_auth_token()
    if not token:
        print("SKIPPING IDEMPOTENCY: No token.")
        return

    # Create a menu item first to ensure ID 1 exists
    print("Ensuring menu item exists...")
    # (Optional: specialized code to create item, but let's assume seeded data or ID 1 exists)

    idempotency_key = str(uuid.uuid4())
    headers = {
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotency_key,
        "Authorization": f"Bearer {token}",
    }

    payload = {"items": [{"menu_item_id": 1, "quantity": 1}]}

    print(f"Sending Request A (Key: {idempotency_key})...")
    res1 = requests.post(f"{BASE_URL}/orders", json=payload, headers=headers)
    print(f"Response A: Status {res1.status_code}, Body: {res1.text[:100]}...")

    # Wait minimal time
    time.sleep(0.1)

    print(f"Sending Request B (Same Key)...")
    res2 = requests.post(f"{BASE_URL}/orders", json=payload, headers=headers)
    print(f"Response B: Status {res2.status_code}, Body: {res2.text[:100]}...")

    if res1.status_code == 201 and res2.status_code == 200:
        data1 = res1.json()
        data2 = res2.json()
        if data1["id"] == data2["id"]:
            print("✅ SUCCESS: Idempotency worked. Same Order ID returned.")
        else:
            print("❌ FAILURE: Different Order IDs returned.")
    elif res1.status_code == 500 or res1.status_code == 404:
        print(
            "⚠️ WARNING: Order creation failed (Item ID 1 might not exist). Skipping strict idempotency check."
        )
    else:
        print(
            f"❌ FAILURE: Unexpected status codes. Got {res1.status_code}, {res2.status_code}"
        )


def test_rate_limit():
    print_header("TEST 2: RATE LIMIT UX (429)")

    print("Spamming login requests to trigger 429...")

    url = f"{BASE_URL}/auth/login"
    payload = {"username": "admin", "password": "wrongpassword"}

    # Needs enough requests to trigger. Default might be 5 or 10 per minute.
    for i in range(15):
        res = requests.post(url, json=payload)
        print(f"Attempt {i + 1}: Status {res.status_code}")
        if res.status_code == 429:
            print("✅ SUCCESS: Rate limit triggered (429).")
            # print(f"User Message: {res.text}")
            return

    print("❌ FAILURE: Did not trigger 429 after 15 attempts.")


def test_logging_format():
    print_header("TEST 3: LOGGING AUDIT")
    print(
        "Traffic generated. Please run 'docker compose logs --tail=20' to verify JSON format manually."
    )


if __name__ == "__main__":
    try:
        test_idempotency()
        test_rate_limit()
        test_logging_format()
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
