-- Create Game Night Menu table
CREATE TABLE IF NOT EXISTS game_night_menu (
    menu_id SERIAL PRIMARY KEY,
    drink_name TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT DEFAULT '$5',
    display_order INT,
    UNIQUE(drink_name)
);

-- Insert Game Night Menu items
-- Note: Using exact drink names as they appear in the drinks table
INSERT INTO game_night_menu (drink_name, description, display_order) VALUES
('Old Fashioned', 'You''re an alcoholic, welcome to the club', 1),
('Negroni', 'if you want the Zach version, ask for the To-Groni. Can sub base spirit for whatever (Mezcal, Tequila, Whiskey)', 2),
('Espresso Martini', 'we up', 3),
('Whiskey Sour', 'you''re getting egg white whether you think you want it or not', 4),
('Dry Martini', 'dry only, gin or vodka', 5),
('Manhattan', 'these kinda gross NGL', 6),
('Margarita', 'for your divas', 7),
('Gimlet', 'Laid back - got my mind on my money and my money on my mind', 8),
('Cosmopolitan', 'This one is probably just for Alex', 9)
ON CONFLICT (drink_name) DO UPDATE SET description = EXCLUDED.description, display_order = EXCLUDED.display_order;

-- Add Gimlet to drinks table if it doesn't exist
INSERT INTO drinks (name, description, glass_type, build_method, garnish)
SELECT 
    'Gimlet',
    'Laid back - got my mind on my money and my money on my mind',
    'Coupe',
    'Shaken',
    'Lime wheel or twist'
WHERE NOT EXISTS (
    SELECT 1 FROM drinks WHERE LOWER(name) = 'gimlet'
);

-- Get the drink_id for Gimlet (or use the one that was just created)
DO $$
DECLARE
    gimlet_drink_id INT;
    gin_id INT;
    simple_syrup_id INT;
    lime_juice_id INT;
BEGIN
    -- Get or create Gimlet drink_id
    SELECT drink_id INTO gimlet_drink_id FROM drinks WHERE LOWER(name) = 'gimlet';
    
    IF gimlet_drink_id IS NULL THEN
        INSERT INTO drinks (name, description, glass_type, build_method, garnish)
        VALUES ('Gimlet', 'Laid back - got my mind on my money and my money on my mind', 'Coupe', 'Shaken', 'Lime wheel or twist')
        RETURNING drink_id INTO gimlet_drink_id;
    END IF;
    
    -- Get or create ingredients
    SELECT ingredient_id INTO gin_id FROM ingredients WHERE LOWER(name) = 'gin';
    IF gin_id IS NULL THEN
        INSERT INTO ingredients (name, category, subcategory) 
        VALUES ('Gin', 'spirit', 'gin')
        RETURNING ingredient_id INTO gin_id;
    END IF;
    
    -- Find simple syrup (exact match first, then fallback)
    SELECT ingredient_id INTO simple_syrup_id FROM ingredients WHERE name = 'Simple Syrup';
    IF simple_syrup_id IS NULL THEN
        SELECT ingredient_id INTO simple_syrup_id FROM ingredients WHERE name = 'Sugar Syrup';
    END IF;
    IF simple_syrup_id IS NULL THEN
        INSERT INTO ingredients (name, category, subcategory) 
        VALUES ('Simple Syrup', 'modifier', 'sweetener')
        RETURNING ingredient_id INTO simple_syrup_id;
    END IF;
    
    -- Find lime juice (exact match first, then fallback)
    SELECT ingredient_id INTO lime_juice_id FROM ingredients WHERE name = 'Fresh Lime Juice';
    IF lime_juice_id IS NULL THEN
        SELECT ingredient_id INTO lime_juice_id FROM ingredients WHERE name = 'Freshly Squeezed Lime Juice';
    END IF;
    IF lime_juice_id IS NULL THEN
        INSERT INTO ingredients (name, category, subcategory) 
        VALUES ('Fresh Lime Juice', 'juice', 'citrus')
        RETURNING ingredient_id INTO lime_juice_id;
    END IF;
    
    -- Insert drink ingredients (using ON CONFLICT to avoid duplicates)
    INSERT INTO drink_ingredients (drink_id, ingredient_id, amount, unit)
    VALUES 
        (gimlet_drink_id, gin_id, '2', 'oz'),
        (gimlet_drink_id, simple_syrup_id, '3/4', 'oz'),
        (gimlet_drink_id, lime_juice_id, '1/2', 'oz')
    ON CONFLICT (drink_id, ingredient_id) DO NOTHING;
END $$;

