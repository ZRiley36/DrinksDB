-- Drinks with Risha menu: table + taste blurbs.
-- Links to drinks table via db_drink_name (so we can display "The Americano" but join on "Americano").
-- Run this after your main schema and seed data. If you use a hosted DB (e.g. Render), run this in the SQL console.

-- Create Drinks with Risha menu table
CREATE TABLE IF NOT EXISTS drinks_with_risha_menu (
    menu_id SERIAL PRIMARY KEY,
    drink_name TEXT NOT NULL UNIQUE,
    db_drink_name TEXT,
    description TEXT NOT NULL,
    display_order INT
);

-- Add Bijou to drinks table if it doesn't exist (classic: gin, green Chartreuse, sweet vermouth, orange bitters)
INSERT INTO drinks (name, description, glass_type, build_method, garnish)
SELECT
    'Bijou',
    'Pour all ingredients into mixing glass with ice cubes. Stir well. Strain into chilled cocktail glass.',
    'Martini',
    'Stirred',
    'Cherry'
WHERE NOT EXISTS (SELECT 1 FROM drinks WHERE LOWER(name) = 'bijou');

-- Add Bijou ingredients if not already linked
DO $$
DECLARE
    bijou_drink_id INT;
BEGIN
    SELECT drink_id INTO bijou_drink_id FROM drinks WHERE LOWER(name) = 'bijou';
    IF bijou_drink_id IS NOT NULL THEN
        INSERT INTO drink_ingredients (drink_id, ingredient_id, amount, unit)
        SELECT bijou_drink_id, i.ingredient_id, v.amount, v.unit
        FROM (VALUES
            ('Gin', '1', 'oz'),
            ('Green Chartreuse', '1', 'oz'),
            ('Sweet Red Vermouth', '1', 'oz'),
            ('Orange Bitters', '2', 'dashes')
        ) AS v(ingredient_name, amount, unit)
        JOIN ingredients i ON LOWER(i.name) = LOWER(v.ingredient_name)
        WHERE NOT EXISTS (
            SELECT 1 FROM drink_ingredients di
            WHERE di.drink_id = bijou_drink_id AND di.ingredient_id = i.ingredient_id
        );
    END IF;
END $$;

-- Add Olive Brine ingredient if not exists (for Dirty Martini)
INSERT INTO ingredients (name, category, subcategory)
SELECT 'Olive Brine', 'modifier', 'savory'
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = 'olive brine');

-- Add Dirty Martini (gin + dry vermouth + olive brine) if not exists
INSERT INTO drinks (name, description, glass_type, build_method, garnish)
SELECT
    'Dirty Martini',
    'Pour all ingredients into mixing glass with ice cubes. Stir well. Strain into chilled martini glass.',
    'Martini',
    'Stirred',
    'Olives'
WHERE NOT EXISTS (SELECT 1 FROM drinks WHERE LOWER(name) = 'dirty martini');

-- Add Dirty Martini ingredients if not already linked
DO $$
DECLARE
    dirty_drink_id INT;
BEGIN
    SELECT drink_id INTO dirty_drink_id FROM drinks WHERE LOWER(name) = 'dirty martini';
    IF dirty_drink_id IS NOT NULL THEN
        INSERT INTO drink_ingredients (drink_id, ingredient_id, amount, unit)
        SELECT dirty_drink_id, i.ingredient_id, v.amount, v.unit
        FROM (VALUES
            ('Gin', '2', 'oz'),
            ('Dry Vermouth', '1/3', 'oz'),
            ('Olive Brine', '1/2', 'oz')
        ) AS v(ingredient_name, amount, unit)
        JOIN ingredients i ON LOWER(i.name) = LOWER(v.ingredient_name)
        WHERE NOT EXISTS (
            SELECT 1 FROM drink_ingredients di
            WHERE di.drink_id = dirty_drink_id AND di.ingredient_id = i.ingredient_id
        );
    END IF;
END $$;

-- Insert Drinks with Risha menu items (taste blurbs + display order)
-- db_drink_name: exact name in drinks table for JOIN; NULL means use drink_name
-- Tone: as if saying to her at the bar; flirty, not a dossier.
INSERT INTO drinks_with_risha_menu (drink_name, db_drink_name, description, display_order) VALUES
('The Americano', 'Americano', 'Better than a Campari spritz.', 1),
('Dirty Martini (gin)', 'Dirty Martini', 'Your drink of choice, apparently. I might omit the olive juice in mine.', 2),
('The Bijou', 'Bijou', 'I''ve never made one of these but I wanted to try, and it seemed to fit.', 3),
('The Boulevardier', 'Boulevardier', 'No idea if you''ll like this, but you reportedly like negronis.', 4)
ON CONFLICT (drink_name) DO UPDATE SET
    db_drink_name = EXCLUDED.db_drink_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- Set garnishes for Americano and Boulevardier
UPDATE drinks SET garnish = 'Orange slice' WHERE LOWER(name) = LOWER('Americano');
UPDATE drinks SET garnish = 'Orange twist' WHERE LOWER(name) = LOWER('Boulevardier');
