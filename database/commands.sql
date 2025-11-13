-- Drop existing tables (optional)


DROP TABLE IF EXISTS drink_flavor_profiles;

DROP TABLE IF EXISTS drink_ingredients;

DROP TABLE IF EXISTS ingredients; 

DROP TABLE IF EXISTS drinks; 


-- Create tables

 
CREATE TABLE drinks (
    drink_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    glass_type TEXT,         -- e.g., "rocks", "martini", "collins"
    build_method TEXT,       -- e.g., "Stirred", "Shaken", "In Glass"
    garnish TEXT             -- e.g., "lemon twist", "olive"
);


CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,           -- e.g., "spirit", "liqueur", "juice", "modifier"
    subcategory TEXT,        -- e.g., "whiskey", "amaro", "orange juice"
    abv NUMERIC(4,2)         -- e.g., 40.00 for 40% ABV
);

CREATE TABLE drink_ingredients (
    drink_id INT REFERENCES drinks(drink_id),
    ingredient_id INT REFERENCES ingredients(ingredient_id),
    amount TEXT,       -- e.g., '1.5', '2', or 'dash'
    unit TEXT,         -- e.g., 'oz', 'ml', 'dash', 'tsp'
    PRIMARY KEY (drink_id, ingredient_id)
);

CREATE TABLE drink_flavor_profiles (
    drink_id INT PRIMARY KEY REFERENCES drinks(drink_id) ON DELETE CASCADE,
    sweetness NUMERIC(3,1) CHECK (sweetness >= 0 AND sweetness <= 10),      -- 0-10 scale
    sourness NUMERIC(3,1) CHECK (sourness >= 0 AND sourness <= 10),          -- 0-10 scale
    bitterness NUMERIC(3,1) CHECK (bitterness >= 0 AND bitterness <= 10),   -- 0-10 scale
    saltiness NUMERIC(3,1) CHECK (saltiness >= 0 AND saltiness <= 10),      -- 0-10 scale
    umami NUMERIC(3,1) CHECK (umami >= 0 AND umami <= 10),                  -- 0-10 scale
    spiciness NUMERIC(3,1) CHECK (spiciness >= 0 AND spiciness <= 10),      -- 0-10 scale
    herbal NUMERIC(3,1) CHECK (herbal >= 0 AND herbal <= 10),               -- 0-10 scale
    fruity NUMERIC(3,1) CHECK (fruity >= 0 AND fruity <= 10),                -- 0-10 scale
    floral NUMERIC(3,1) CHECK (floral >= 0 AND floral <= 10),                -- 0-10 scale
    smoky NUMERIC(3,1) CHECK (smoky >= 0 AND smoky <= 10),                   -- 0-10 scale
    complexity NUMERIC(3,1) CHECK (complexity >= 0 AND complexity <= 10),   -- Overall complexity
    intensity NUMERIC(3,1) CHECK (intensity >= 0 AND intensity <= 10)        -- Overall flavor intensity
);


-- Insert sample data
-- See seed_data.sql for INSERT statements


-- Create indexes / constraints

-- Indexes for flavor profile similarity queries
CREATE INDEX idx_flavor_sweetness ON drink_flavor_profiles(sweetness);
CREATE INDEX idx_flavor_bitterness ON drink_flavor_profiles(bitterness);
CREATE INDEX idx_flavor_sourness ON drink_flavor_profiles(sourness);
