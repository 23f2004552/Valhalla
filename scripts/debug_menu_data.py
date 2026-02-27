import requests
import json

API_URL = "http://localhost:8080/api"

print("🔍 DEBUG MENU DATA")

# 1. Categories
try:
    cats = requests.get(f"{API_URL}/categories").json()
    print("\n📂 CATEGORIES:")
    print(json.dumps(cats, indent=2))
except Exception as e:
    print(f"❌ Failed to fetch categories: {e}")

# 2. Menu Items
try:
    items = requests.get(f"{API_URL}/menu").json()
    print("\nxb4 MENU ITEMS:")
    print(json.dumps(items, indent=2))
except Exception as e:
    print(f"❌ Failed to fetch menu: {e}")
