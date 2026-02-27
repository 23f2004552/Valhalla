import psycopg2
import requests
import sys
import time

# Configuration
DB_HOST = "127.0.0.1"
DB_PORT = "5432"
DB_USER = "postgres"
DB_PASS = "password"

SERVICES_DBS = ["menudb", "orderdb", "inventorydb", "paymentdb", "analyticsdb"]

REQUIRED_TABLES = {
    "menudb": ["menu_items", "categories"],
    "orderdb": ["orders", "order_items"],
    "inventorydb": ["ingredients", "menu_ingredient_map"],
    "paymentdb": ["payments"],
}

REQUIRED_FKS = {
    "menudb": {"menu_items": ["category_id"]},
    "orderdb": {"order_items": ["order_id"]},
    "inventorydb": {"menu_ingredient_map": ["ingredient_id"]},
}

RABBITMQ_API = "http://localhost:15672/api"
RABBITMQ_USER = "guest"
RABBITMQ_PASS = "guest"


def check_db_integrity():
    print(">>> Checking Database Integrity...")
    try:
        # Check databases exist
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT,
        )
        cur = conn.cursor()
        cur.execute("SELECT datname FROM pg_database;")
        rows = cur.fetchall()
        existing_dbs = [row[0] for row in rows]
        conn.close()

        for db in SERVICES_DBS:
            if db not in existing_dbs:
                print(f"❌ Database Missing: {db}")
                return False
            print(f"✅ Database Exists: {db}")

            # Check tables
            if db in REQUIRED_TABLES:
                conn_db = psycopg2.connect(
                    dbname=db,
                    user=DB_USER,
                    password=DB_PASS,
                    host=DB_HOST,
                    port=DB_PORT,
                )
                cur_db = conn_db.cursor()
                cur_db.execute(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
                )
                tables = [r[0] for r in cur_db.fetchall()]
                conn_db.close()

                for tbl in REQUIRED_TABLES[db]:
                    if tbl not in tables:
                        print(f"❌ Table Missing in {db}: {tbl}")
                        return False
                    print(f"   ✅ Table Exists: {tbl}")

                    # Verify transaction_id in orders
                    if db == "orderdb" and tbl == "orders":
                        conn_db = psycopg2.connect(
                            dbname=db,
                            user=DB_USER,
                            password=DB_PASS,
                            host=DB_HOST,
                            port=DB_PORT,
                        )
                        cur_db = conn_db.cursor()
                        cur_db.execute(
                            "SELECT column_name FROM information_schema.columns WHERE table_name='orders';"
                        )
                        cols = [c[0] for c in cur_db.fetchall()]
                        conn_db.close()
                        if "transaction_id" not in cols:
                            print(f"❌ Column Missing in {db}.{tbl}: transaction_id")
                            return False
                        print(f"   ✅ Column Exists: transaction_id")

                # Check Foreign Keys
                if db in REQUIRED_FKS:
                    conn_db = psycopg2.connect(
                        dbname=db,
                        user=DB_USER,
                        password=DB_PASS,
                        host=DB_HOST,
                        port=DB_PORT,
                    )
                    cur_db = conn_db.cursor()
                    for tbl, fks in REQUIRED_FKS[db].items():
                        for fk_col in fks:
                            # Strict check using information_schema
                            query = f"""
                            SELECT count(*) 
                            FROM information_schema.key_column_usage kcu
                            JOIN information_schema.referential_constraints rc 
                            ON kcu.constraint_name = rc.constraint_name
                            WHERE kcu.table_name = '{tbl}' AND kcu.column_name = '{fk_col}';
                            """
                            cur_db.execute(query)
                            count = cur_db.fetchone()[0]
                            if count == 0:
                                print(f"❌ Foreign Key Missing on {db}.{tbl}.{fk_col}")
                                return False
                            print(f"   ✅ FK Validated: {tbl}.{fk_col}")
                    conn_db.close()

    except Exception as e:
        print(f"❌ DB Check Failed: {e}")
        return False
    return True


def check_rabbitmq_integrity():
    print("\n>>> Checking RabbitMQ Integrity...")
    max_retries = 10
    for attempt in range(max_retries):
        try:
            # Check Queues
            resp = requests.get(
                f"{RABBITMQ_API}/queues", auth=(RABBITMQ_USER, RABBITMQ_PASS), timeout=5
            )
            if resp.status_code != 200:
                print(
                    f"   [Attempt {attempt + 1}] RabbitMQ API check failed: {resp.status_code}"
                )
                time.sleep(3)
                continue

            queues = resp.json()
            print(f"   [Debug] Found Queues: {[q['name'] for q in queues]}")
            analytics_queue = next(
                (q for q in queues if q["name"] == "analytics_queue"), None
            )

            if not analytics_queue:
                print(
                    f"   [Attempt {attempt + 1}] Queue 'analytics_queue' not found yet..."
                )
                time.sleep(3)
                continue

            if not analytics_queue.get("durable"):
                print("❌ Queue 'analytics_queue' is NOT Durable")
                return False

            print(f"✅ Durable Queue Found: analytics_queue")

            # Check Exchanges
            resp = requests.get(
                f"{RABBITMQ_API}/exchanges",
                auth=(RABBITMQ_USER, RABBITMQ_PASS),
                timeout=5,
            )
            exchanges = resp.json()
            exchange = next(
                (e for e in exchanges if e["name"] == "orders_exchange"), None
            )

            if not exchange:
                print("❌ Exchange 'orders_exchange' Missing")
                return False

            if not exchange.get("durable"):
                print("❌ Exchange 'orders_exchange' is NOT Durable")
                return False

            print(f"✅ Durable Exchange Found: orders_exchange")

            # Check Bindings
            resp = requests.get(
                f"{RABBITMQ_API}/bindings",
                auth=(RABBITMQ_USER, RABBITMQ_PASS),
                timeout=5,
            )
            bindings = resp.json()
            # Look for binding: source=orders_exchange, destination=analytics_queue
            binding = next(
                (
                    b
                    for b in bindings
                    if b["source"] == "orders_exchange"
                    and b["destination"] == "analytics_queue"
                ),
                None,
            )

            if not binding:
                print("❌ Binding Missing: orders_exchange -> analytics_queue")
                return False

            print(f"✅ Topology Verified: orders_exchange -> analytics_queue")
            return True

        except Exception as e:
            print(f"   [Attempt {attempt + 1}] Check Failed: {e}")
            time.sleep(3)

    print("❌ RabbitMQ Integrity Check Timeout")
    return False


if __name__ == "__main__":
    if check_db_integrity() and check_rabbitmq_integrity():
        print("\n🎉 DEEP BOOT VALIDATION PASSED")
        sys.exit(0)
    else:
        print("\n💥 DEEP BOOT VALIDATION FAILED")
        sys.exit(1)
