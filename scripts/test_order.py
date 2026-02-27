import requests
import json
import sys


def test_create_order():
    url = "http://localhost:8080/api/orders"
    payload = {"items": [{"menu_item_id": 1, "quantity": 1}]}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(f"Order Created Successfully: {response.json()}")
    except Exception as e:
        print(f"Order Creation Failed: {e}")
        if hasattr(e, "response") and e.response:
            print(f"Response Body: {e.response.text}")
        sys.exit(1)


if __name__ == "__main__":
    test_create_order()
