import requests
import json

URL = "http://localhost:8080/api/menu"

try:
    res = requests.get(URL)
    data = res.json()
    print("📦 MENU ITEMS:")
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"❌ Error: {e}")
