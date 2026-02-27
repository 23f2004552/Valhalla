import requests
import json

URL = "http://localhost:8080/api/menu"

payload = {
    "name": "Saffron & Gold Risotto",
    "price": 3200.0,
    "description": "Aged carnaroli rice, Iranian saffron, 24k gold leaf.",
    "is_available": True,
    "category_id": 1,
}

print(f"Sending: {payload}")
res = requests.post(URL, json=payload)
print(f"Status: {res.status_code}")
if res.status_code == 201:
    print(f"✅ Created: {res.json()['name']}")
else:
    print(f"❌ Failed: {res.text}")
