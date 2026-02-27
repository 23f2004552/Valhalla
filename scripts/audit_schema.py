import psycopg2
import sys

DB_HOST = "localhost"
DB_PORT = "5432"
DB_USER = "postgres"
DB_PASSWORD = "password"

DATABASES = ["authdb", "menudb", "orderdb", "inventorydb", "paymentdb", "analyticsdb"]


def get_table_schema(cursor, table_name):
    print(f"\n--- Table: {table_name} ---")

    # Columns
    cursor.execute(f"""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        ORDER BY ordinal_position;
    """)
    columns = cursor.fetchall()
    print("Columns:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]} (Nullable: {col[2]})")

    # Constraints (PK, Unique, FK)
    cursor.execute(f"""
        SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = '{table_name}'
        ORDER BY tc.constraint_name;
    """)
    print("Constraints:")
    constraints = cursor.fetchall()
    if constraints:
        for con in constraints:
            print(f"  - {con[0]} ({con[1]}): {con[2]}")
    else:
        print("  (None)")


def audit_database(db_name):
    print(f"\n\n=== AUDITING DATABASE: {db_name} ===")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=db_name,
        )
        cur = conn.cursor()

        # Get all public tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
        """)
        tables = [t[0] for t in cur.fetchall()]

        for table in tables:
            get_table_schema(cur, table)

        conn.close()
    except Exception as e:
        print(f"FAILED to audit {db_name}: {e}")


if __name__ == "__main__":
    print("Starting Schema Consistency Audit...")
    for db in DATABASES:
        audit_database(db)
    print("\nAudit Complete.")
