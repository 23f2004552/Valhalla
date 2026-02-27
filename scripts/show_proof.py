import requests

BASE = "http://localhost:3000"


def check(url, key):
    try:
        res = requests.get(url)
        if key in res.text:
            print(f"✅ [VERIFIED] {url} contains '{key}'")
            # Print context
            start = res.text.find(key)
            snippet = res.text[
                max(0, start - 50) : min(len(res.text), start + 100)
            ].replace("\n", " ")
            print(f'   Context: "...{snippet}..."')
        else:
            print(f"❌ [FAILED] {url} missing '{key}'")
    except Exception as e:
        print(f"❌ [ERROR] {url}: {e}")


print("🔍 AUTO-VERIFICATION LOG:")
check(BASE, "VALHALLA")
check(f"{BASE}/menu", "Saffron")
check(f"{BASE}/admin", "Command Center")
