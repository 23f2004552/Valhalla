import requests
import sys
import uuid

API_URL = "http://localhost:8080/api"


def test_idempotency():
    print(">>> Testing Payment Idempotency...")

    # 1. Create a dummy order to get a valid ID (or just use a random ID if Foreign Key not strict?)
    # Payment Service likely checks Order ID existence if FK constraint exists.
    # Let's check schemas... PaymentDB has order_id integer.
    # But does it check existence in OrderDB? They are separate DBs!
    # So we can use ANY integer order_id.

    order_id = 99999  # Random ID, assuming no strict cross-service/cross-db check logic in Payment Service itself
    amount = 50.00

    print(f"1. Sending First Payment Request for Order {order_id}...")
    payload = {"order_id": order_id, "amount": amount, "payment_method": "CARD"}

    resp1 = requests.post(f"{API_URL}/payments", json=payload)
    if resp1.status_code not in [200, 201]:
        print(f"❌ First Request Failed: {resp1.status_code} - {resp1.text}")
        sys.exit(1)

    data1 = resp1.json()
    tx_id_1 = data1.get("transaction_id")
    print(f"   ✅ Tx ID 1: {tx_id_1}")

    print(f"2. Sending DUPLICATE Payment Request for Order {order_id}...")
    resp2 = requests.post(f"{API_URL}/payments", json=payload)
    if resp2.status_code not in [200, 201]:
        print(f"❌ Second Request Failed: {resp2.status_code} - {resp2.text}")
        sys.exit(1)

    data2 = resp2.json()
    tx_id_2 = data2.get("transaction_id")
    print(f"   ✅ Tx ID 2: {tx_id_2}")

    if tx_id_1 == tx_id_2:
        print("🎉 IDEMPOTENCY VERIFIED: Transaction IDs Match!")
        sys.exit(0)
    else:
        print(
            f"❌ IDEMPOTENCY FAILED: Different IDs generated! ({tx_id_1} vs {tx_id_2})"
        )
        sys.exit(1)


if __name__ == "__main__":
    try:
        test_idempotency()
    except Exception as e:
        print(f"❌ Script Error: {e}")
        sys.exit(1)
