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

-- Insert Drinks with Risha menu items (taste blurbs + display order)
-- db_drink_name: exact name in drinks table for JOIN; NULL means use drink_name
INSERT INTO drinks_with_risha_menu (drink_name, db_drink_name, description, display_order) VALUES
('The Americano', 'Americano', 'Bitter-sweet and refreshing—Campari and vermouth with a splash of soda. Low-proof and citrusy.', 1),
('Dirty Martini (gin)', 'Dry Martini', 'Crisp, bracing, with a savory olive brine kick. Gin-forward and dry.', 2),
('The Bijou', 'Bijou', 'Herbal, sweet, and complex—gin, Chartreuse, and vermouth. Jewel-toned and silky.', 3),
('The Boulevardier', 'Boulevardier', 'Bold and bitter-sweet; bourbon, Campari, and vermouth. Like a whiskey Negroni.', 4)
ON CONFLICT (drink_name) DO UPDATE SET
    db_drink_name = EXCLUDED.db_drink_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- Allow re-running: update descriptions/order if table has no UNIQUE constraint on name
-- If you need to update blurbs later:
-- UPDATE drinks_with_risha_menu SET description = '...' WHERE drink_name = 'The Americano';
