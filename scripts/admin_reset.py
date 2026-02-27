import psycopg2
import sys

# Config
DB_PARAMS = "user=postgres password=password host=127.0.0.1 port=5432"


def run_reset():
    print(">>> 🧹 RESETTING SYSTEM STATE...")

    try:
        # 1. Reset Inventory
        print("   -> Resetting Inventory Stock...")
        conn = psycopg2.connect(f"{DB_PARAMS} dbname=inventorydb")
        cur = conn.cursor()
        cur.execute(
            "UPDATE ingredients SET current_stock = 500 WHERE id = 1;"
        )  # Saffron
        cur.execute("UPDATE ingredients SET current_stock = 1000 WHERE id = 4;")  # Rice
        conn.commit()
        conn.close()

        # 2. Reset Orders & Outbox
        print("   -> Truncating Orders & Outbox...")
        conn = psycopg2.connect(f"{DB_PARAMS} dbname=orderdb")
        cur = conn.cursor()
        cur.execute("TRUNCATE TABLE order_items CASCADE;")
        cur.execute("TRUNCATE TABLE orders CASCADE;")
        cur.execute("TRUNCATE TABLE outbox_events CASCADE;")
        conn.commit()
        conn.close()

        # 3. Reset Payments
        print("   -> Truncating Payments...")
        conn = psycopg2.connect(f"{DB_PARAMS} dbname=paymentdb")
        cur = conn.cursor()
        cur.execute("TRUNCATE TABLE payments CASCADE;")
        conn.commit()
        conn.close()

        print("✅ System Reset Complete.")

    except Exception as e:
        print(f"❌ Reset Failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    run_reset()
