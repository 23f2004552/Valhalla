import requests

URL = "http://localhost:8080/api/menu"

payload = {
    "name": "TEST_ITEM_SAFFRON",
    "price": 100.0,
    "description": "Test Desc",
    "is_available": True,
    "category_id": 1,
}

print(f"Sending: {payload}")
res = requests.post(URL, json=payload)
print(f"Status: {res.status_code}")
print(f"Body: {res.text}")
