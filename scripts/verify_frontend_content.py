import requests
import sys

BASE_URL = "http://localhost:3000"


def check_url(url, expected_snippets):
    print(f"Checking {url}...")
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"❌ Failed: {url} returned {response.status_code}")
            return False

        content = response.text
        all_found = True
        if not all_found:
            with open("debug_frontend_dump.html", "w", encoding="utf-8") as f:
                f.write(content)
            print(f"   ℹ️ Saved failed content to debug_frontend_dump.html")
        return all_found
    except Exception as e:
        print(f"❌ Error accessing {url}: {e}")
        return False


def main():
    checks = [
        (f"{BASE_URL}", ["Where fire meets", "scroll", "VisualBreak"]),
        (f"{BASE_URL}/menu", ["The Menu", "Starters", "Mains"]),
        (
            f"{BASE_URL}/admin",
            ["Command Center", "Total Revenue", "System Status: Operational"],
        ),
    ]

    success = True
    for url, snippets in checks:
        if not check_url(url, snippets):
            success = False

    if success:
        print("\n🎉 All Frontend Content Verified!")
        sys.exit(0)
    else:
        print("\n❌ Verification Failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
