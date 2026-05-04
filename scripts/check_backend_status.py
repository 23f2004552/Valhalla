import requests
import sys

SERVICES = {
    "Auth": "http://localhost:3000/api/auth/",
    "Menu": "http://localhost:3000/api/menu",
    "Categories": "http://localhost:3000/api/menu/categories",
    "Inventory": "http://localhost:3000/api/inventory",
    "Analytics": "http://localhost:3000/api/analytics/daily-sales",
}


def check():
    all_ok = True
    print("🔍 Checking Backend Services...")

    for name, url in SERVICES.items():
        try:
            res = requests.get(url, timeout=2)
            if res.status_code < 500:
                print(f"   ✅ {name}: UP ({res.status_code})")
                if name == "Menu":
                    count = len(res.json())
                    print(f"      Items: {count}")
                if name == "Categories":
                    count = len(res.json())
                    print(f"      Categories: {count}")
            else:
                print(f"   ❌ {name}: ERROR ({res.status_code})")
                all_ok = False
        except Exception as e:
            print(f"   ❌ {name}: DOWN ({e})")
            all_ok = False

    if all_ok:
        print("\n✅ All Backend Services Accessible via Gateway.")
    else:
        print("\n❌ Some Backend Services are Down/Erroring.")


if __name__ == "__main__":
    check()
