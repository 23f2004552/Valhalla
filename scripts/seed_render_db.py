import sqlalchemy
import sys

DATABASE_URL = "postgresql://valhalla_db_user:BSZwdJpdURcUrjIKgi98DBGvifBlRAdO@dpg-d7sbq5n7f7vs73djlngg-a.oregon-postgres.render.com/valhalla_db"

print(f"Connecting to {DATABASE_URL} ...")
engine = sqlalchemy.create_engine(DATABASE_URL)

sql_commands = [
    """
    INSERT INTO categories (id, name) VALUES (1, 'Starters'), (2, 'Mains'), (3, 'Desserts') 
    ON CONFLICT (id) DO NOTHING;
    """,
    """
    INSERT INTO menu_items (id, name, description, price, is_available, category_id) VALUES
    (1, 'Saffron Risotto', 'Aged carnaroli rice, Iranian saffron.', 3200, true, 2),
    (2, 'Wagyu Tartare', 'A5 Japanese Wagyu, pine nut emulsion.', 4500, true, 1),
    (3, 'Velvet Cacao', 'Single-origin dark chocolate, hazelnut praline.', 1800, true, 3),
    (99, 'Chaos Crunch', 'Always fails payment.', 999.00, true, 1) 
    ON CONFLICT (id) DO NOTHING;
    """,
    "SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));",
    "SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));",
]

try:
    with engine.connect() as conn:
        for cmd in sql_commands:
            conn.execute(sqlalchemy.text(cmd))
            conn.commit()
    print("Database seeded successfully!")
except Exception as e:
    print(f"Error: {e}")
