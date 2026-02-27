-- RMS Platform Initialization Script
-- This script creates all microservice databases, schemas, and initial seed data.

-- 1. Create Databases
CREATE DATABASE menudb;
CREATE DATABASE authdb;

-- 2. Initialize Menu Service (menudb)
\c menudb;

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    price FLOAT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR,
    category_id INTEGER REFERENCES categories(id)
);

-- Seed Menu Data
INSERT INTO categories (id, name) VALUES (1, 'Starters'), (2, 'Mains'), (3, 'Desserts') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_items (id, name, description, price, is_available, category_id) VALUES
(1, 'Saffron Risotto', 'Aged carnaroli rice, Iranian saffron.', 3200, true, 2),
(2, 'Wagyu Tartare', 'A5 Japanese Wagyu, pine nut emulsion.', 4500, true, 1),
(3, 'Velvet Cacao', 'Single-origin dark chocolate, hazelnut praline.', 1800, true, 3),
(99, 'Chaos Crunch', 'Always fails payment.', 999.00, true, 1) -- Price 999 triggers Mock Payment Failure
ON CONFLICT (id) DO NOTHING;

-- Reset Sequences
\c menudb;
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));
