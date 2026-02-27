"""
Seed script: Full premium restaurant menu with 6 categories and 30+ dishes.
Run inside the menu-service container: python seed_data.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models import Category, MenuItem

# ── Unsplash image URLs for each dish ──
DISH_IMAGES = {
    # Starters
    "Caesar Salad": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&auto=format&fit=crop&q=80",
    "Truffle Risotto": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop&q=80",
    "Bruschetta Trio": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop&q=80",
    "Prawn Tempura": "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&auto=format&fit=crop&q=80",
    "Caprese Salad": "https://images.unsplash.com/photo-1608032077018-c9aad9565d29?w=600&auto=format&fit=crop&q=80",
    "French Onion Soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
    # Main Course
    "Wagyu Steak": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&auto=format&fit=crop&q=80",
    "Pan-Seared Salmon": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80",
    "Lobster Thermidor": "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&auto=format&fit=crop&q=80",
    "Lamb Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
    "Grilled Rack of Lamb": "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=600&auto=format&fit=crop&q=80",
    "Duck Confit": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&auto=format&fit=crop&q=80",
    "Seafood Paella": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&auto=format&fit=crop&q=80",
    # Pasta & Risotto
    "Truffle Pasta": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&auto=format&fit=crop&q=80",
    "Lobster Ravioli": "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&auto=format&fit=crop&q=80",
    "Spaghetti Carbonara": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80",
    "Mushroom Risotto": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop&q=80",
    "Penne Arrabbiata": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&auto=format&fit=crop&q=80",
    # Desserts
    "Crème Brûlée": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&auto=format&fit=crop&q=80",
    "Tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
    "Chocolate Lava Cake": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&auto=format&fit=crop&q=80",
    "Panna Cotta": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
    "Cheesecake": "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&auto=format&fit=crop&q=80",
    "Mango Sorbet": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80",
    # Beverages
    "Mango Lassi": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
    "Espresso Martini": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
    "Craft Old Fashioned": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&auto=format&fit=crop&q=80",
    "Sparkling Water": "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&auto=format&fit=crop&q=80",
    "Classic Mojito": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&auto=format&fit=crop&q=80",
    "Masala Chai": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&auto=format&fit=crop&q=80",
    "Fresh Juice Flight": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&auto=format&fit=crop&q=80",
    # Chef's Specials
    "Tasting Menu (7 Course)": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80",
    "Sushi Omakase": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
    "Tandoori Platter": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80",
    "Pho Bo": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
}

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80"

CATEGORIES = [
    {"name": "Starters"},
    {"name": "Main Course"},
    {"name": "Pasta & Risotto"},
    {"name": "Desserts"},
    {"name": "Beverages"},
    {"name": "Chef's Specials"},
]

MENU_ITEMS = [
    # ── Starters ──
    {"name": "Caesar Salad", "description": "Crisp romaine, aged parmesan, anchovy dressing, garlic croutons", "price": 450, "category": "Starters"},
    {"name": "Truffle Risotto", "description": "Arborio rice, black truffle shavings, parmesan foam", "price": 750, "category": "Starters"},
    {"name": "Bruschetta Trio", "description": "Tomato basil, mushroom truffle, smoked salmon on sourdough", "price": 550, "category": "Starters"},
    {"name": "Prawn Tempura", "description": "Tiger prawns, yuzu ponzu, pickled ginger, wasabi aioli", "price": 850, "category": "Starters"},
    {"name": "Caprese Salad", "description": "Buffalo mozzarella, heirloom tomatoes, basil pesto, aged balsamic", "price": 480, "category": "Starters"},
    {"name": "French Onion Soup", "description": "Caramelized onion broth, gruyère crouton, thyme oil", "price": 420, "category": "Starters"},

    # ── Main Course ──
    {"name": "Wagyu Steak", "description": "A5 Japanese wagyu, truffle jus, roasted bone marrow, seasonal vegetables", "price": 3500, "category": "Main Course"},
    {"name": "Pan-Seared Salmon", "description": "Norwegian salmon, lemon beurre blanc, asparagus, dill oil", "price": 1200, "category": "Main Course"},
    {"name": "Lobster Thermidor", "description": "Whole lobster, cognac cream, gruyère gratin, herb salad", "price": 2800, "category": "Main Course"},
    {"name": "Lamb Biryani", "description": "Slow-cooked lamb, saffron basmati, raita, crispy onions", "price": 950, "category": "Main Course"},
    {"name": "Butter Chicken", "description": "Tandoori chicken, tomato makhani gravy, kashmiri chili, cream", "price": 850, "category": "Main Course"},
    {"name": "Grilled Rack of Lamb", "description": "Herb-crusted lamb, rosemary jus, dauphinoise potatoes, charred greens", "price": 2200, "category": "Main Course"},
    {"name": "Duck Confit", "description": "Slow-cooked duck leg, orange glaze, potato gratin, baby spinach", "price": 1800, "category": "Main Course"},
    {"name": "Seafood Paella", "description": "Saffron rice, prawns, mussels, calamari, chorizo, lemon aioli", "price": 1600, "category": "Main Course"},

    # ── Pasta & Risotto ──
    {"name": "Truffle Pasta", "description": "Fresh tagliatelle, shaved black truffle, parmesan cream, truffle oil", "price": 1100, "category": "Pasta & Risotto"},
    {"name": "Lobster Ravioli", "description": "Handmade ravioli, lobster bisque sauce, chive oil, micro herbs", "price": 1400, "category": "Pasta & Risotto"},
    {"name": "Spaghetti Carbonara", "description": "Bronze-cut spaghetti, guanciale, pecorino romano, black pepper, egg yolk", "price": 780, "category": "Pasta & Risotto"},
    {"name": "Mushroom Risotto", "description": "Wild porcini, shiitake, oyster mushrooms, aged parmesan, truffle butter", "price": 900, "category": "Pasta & Risotto"},
    {"name": "Penne Arrabbiata", "description": "San Marzano tomatoes, Calabrian chili, fresh basil, olive oil", "price": 650, "category": "Pasta & Risotto"},

    # ── Desserts ──
    {"name": "Crème Brûlée", "description": "Madagascar vanilla, caramelized sugar crust, fresh berries", "price": 550, "category": "Desserts"},
    {"name": "Tiramisu", "description": "Mascarpone, espresso-soaked ladyfingers, cocoa dusting", "price": 500, "category": "Desserts"},
    {"name": "Chocolate Lava Cake", "description": "72% Valrhona chocolate, molten center, vanilla bean ice cream", "price": 650, "category": "Desserts"},
    {"name": "Panna Cotta", "description": "Tahitian vanilla, wild berry compote, mint crystal", "price": 480, "category": "Desserts"},
    {"name": "Cheesecake", "description": "New York style, graham crust, raspberry coulis, basil micro", "price": 520, "category": "Desserts"},
    {"name": "Mango Sorbet", "description": "Alphonso mango, passion fruit gel, coconut tuile", "price": 380, "category": "Desserts"},

    # ── Beverages ──
    {"name": "Mango Lassi", "description": "Fresh Alphonso mango, yogurt, cardamom, saffron strand", "price": 250, "category": "Beverages"},
    {"name": "Espresso Martini", "description": "Vodka, fresh espresso, coffee liqueur, vanilla", "price": 600, "category": "Beverages"},
    {"name": "Craft Old Fashioned", "description": "Bourbon, Angostura bitters, demerara sugar, orange peel", "price": 700, "category": "Beverages"},
    {"name": "Sparkling Water", "description": "San Pellegrino 750ml", "price": 200, "category": "Beverages"},
    {"name": "Classic Mojito", "description": "White rum, fresh mint, lime, soda, cane sugar", "price": 550, "category": "Beverages"},
    {"name": "Masala Chai", "description": "Assam tea, cardamom, ginger, cinnamon, clove, steamed milk", "price": 180, "category": "Beverages"},
    {"name": "Fresh Juice Flight", "description": "Orange, watermelon, green apple — three mini glasses", "price": 350, "category": "Beverages"},

    # ── Chef's Specials ──
    {"name": "Tasting Menu (7 Course)", "description": "Chef's seasonal seven-course journey with wine pairing option", "price": 5500, "category": "Chef's Specials"},
    {"name": "Sushi Omakase", "description": "12-piece chef's selection, wasabi, pickled ginger, premium soy", "price": 3200, "category": "Chef's Specials"},
    {"name": "Tandoori Platter", "description": "Chicken tikka, seekh kebab, paneer tikka, mint chutney, naan", "price": 1200, "category": "Chef's Specials"},
    {"name": "Pho Bo", "description": "48-hour bone broth, rice noodles, rare beef, herbs, chili oil", "price": 680, "category": "Chef's Specials"},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(MenuItem).delete()
        db.query(Category).delete()
        db.commit()

        # Create categories
        cat_map = {}
        for cat_data in CATEGORIES:
            cat = Category(name=cat_data["name"])
            db.add(cat)
            db.flush()
            cat_map[cat_data["name"]] = cat.id
            print(f"Created category: {cat_data['name']} (ID: {cat.id})")

        # Create menu items with images
        for item_data in MENU_ITEMS:
            image_url = DISH_IMAGES.get(item_data["name"], DEFAULT_IMAGE)
            item = MenuItem(
                name=item_data["name"],
                description=item_data["description"],
                price=item_data["price"],
                is_available=True,
                image_url=image_url,
                category_id=cat_map[item_data["category"]],
            )
            db.add(item)
            print(
                f"  Added: {item_data['name']} (₹{item_data['price']}) [{item_data['category']}]"
            )

        db.commit()
        print(
            f"\n✅ Seeded {len(CATEGORIES)} categories and {len(MENU_ITEMS)} menu items with images."
        )

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
