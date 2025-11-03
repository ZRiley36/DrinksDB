-- Sample data insert statements based on Google Sheets data
-- Note: Flavor profiles are placeholder estimates and should be refined based on actual tastings

-- Insert ingredients first (these will be referenced by drinks)
INSERT INTO ingredients (name, category, subcategory, abv) VALUES
-- Spirits
('Whiskey', 'Spirit', 'Whiskey', 40.00),
('Gin', 'Spirit', 'Gin', 40.00),
('White Rum', 'Spirit', 'Rum', 40.00),
('Cognac', 'Spirit', 'Brandy', 40.00),
('Scotch', 'Spirit', 'Whiskey', 40.00),
('Brandy', 'Spirit', 'Brandy', 40.00),
('Vermouth', 'Aromatized Wine', 'Sweet Vermouth', 16.00),
('Dry Vermouth', 'Aromatized Wine', 'Dry Vermouth', 17.00),
('Campari', 'Liqueur', 'Amaro', 24.00),

-- Liqueurs & Modifiers
('White Crème de Cacao', 'Liqueur', 'Crème de Cacao', 25.00),
('Chocolate Liqueur', 'Liqueur', 'Chocolate', 20.00),
('Triple Sec', 'Liqueur', 'Orange Liqueur', 40.00),
('Soda Water', 'Mixer', 'Carbonated Water', 0.00),

-- Citrus & Juices
('Lemon Juice', 'Juice', 'Citrus', 0.00),
('Lime Juice', 'Juice', 'Citrus', 0.00),
('Orange Juice', 'Juice', 'Citrus', 0.00),

-- Sweeteners
('Simple Syrup', 'Sweetener', 'Sugar Syrup', 0.00),
('Granulated Sugar', 'Sweetener', 'Sugar', 0.00),
('Angostura Bitters', 'Bitters', 'Aromatic', 44.70),

-- Dairy & Eggs
('Heavy Cream', 'Dairy', 'Cream', 0.00),
('Egg', 'Egg', 'Whole Egg', 0.00),
('Nutmeg', 'Spice', 'Ground', 0.00);

-- Insert drinks
INSERT INTO drinks (name, description, glass_type, build_method, garnish) VALUES
('Old Fashioned', 'A whiskey classic with sugar, bitters, and orange peel', 'Rocks', 'Stirred', 'Orange Peel, Cherry'),
('Martini', 'The quintessential gin cocktail', 'Martini', 'Stirred', 'Lemon Twist, Olive'),
('Daiquiri', 'Simple rum sour with lime and sugar', 'Coupe', 'Shaken', 'Lime Wedge'),
('Sidecar', 'Cognac-based sour with triple sec and lemon', 'Coupe', 'Shaken', 'Orange Twist'),
('Whiskey Highball', 'Whiskey diluted with soda water or sparkling water', 'Highball', 'In Glass', 'Lemon Wedge'),
('Flip', 'Rich dessert cocktail with egg, cream, and spirits', 'Coupe', 'Shaken', 'Nutmeg'),
('Alexander', 'Sweet dessert cocktail with gin or cognac, crème de cacao, and cream', 'Martini', 'Shaken', 'Nutmeg'),
('Americano', 'Aperol or Campari with vermouth and soda', 'Rocks', 'In Glass', 'Orange Slice, Lemon Twist');

-- Insert drink_ingredients relationships
-- Note: Using drink_id and ingredient_id by referencing the INSERT order
INSERT INTO drink_ingredients (drink_id, ingredient_id, amount, unit) VALUES
-- Old Fashioned
((SELECT drink_id FROM drinks WHERE name = 'Old Fashioned'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Whiskey'), '2', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Old Fashioned'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Simple Syrup'), '0.25', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Old Fashioned'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Angostura Bitters'), '2', 'dash'),

-- Martini
((SELECT drink_id FROM drinks WHERE name = 'Martini'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Gin'), '2.5', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Martini'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Dry Vermouth'), '0.5', 'oz'),

-- Daiquiri
((SELECT drink_id FROM drinks WHERE name = 'Daiquiri'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'White Rum'), '2', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Daiquiri'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Lime Juice'), '1', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Daiquiri'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Simple Syrup'), '0.75', 'oz'),

-- Sidecar
((SELECT drink_id FROM drinks WHERE name = 'Sidecar'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Cognac'), '2', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Sidecar'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Triple Sec'), '1', 'oz'),  -- Note: Need to add Triple Sec to ingredients
((SELECT drink_id FROM drinks WHERE name = 'Sidecar'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Lemon Juice'), '0.75', 'oz'),

-- Whiskey Highball
((SELECT drink_id FROM drinks WHERE name = 'Whiskey Highball'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Scotch'), '2', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Whiskey Highball'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Soda Water'), '4', 'oz'),  -- Note: Need to add Soda Water to ingredients

-- Flip
((SELECT drink_id FROM drinks WHERE name = 'Flip'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Brandy'), '2', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Flip'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Simple Syrup'), '0.75', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Flip'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Egg'), '1', 'whole'),
((SELECT drink_id FROM drinks WHERE name = 'Flip'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Heavy Cream'), '1', 'oz'),

-- Alexander
((SELECT drink_id FROM drinks WHERE name = 'Alexander'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Cognac'), '1', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Alexander'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'White Crème de Cacao'), '1', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Alexander'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Heavy Cream'), '1', 'oz'),

-- Americano
((SELECT drink_id FROM drinks WHERE name = 'Americano'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Campari'), '1.5', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Americano'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Vermouth'), '1.5', 'oz'),
((SELECT drink_id FROM drinks WHERE name = 'Americano'), 
 (SELECT ingredient_id FROM ingredients WHERE name = 'Soda Water'), '2', 'oz');

-- Insert placeholder flavor profiles
-- IMPORTANT: These are rough estimates and should be refined based on actual tastings
INSERT INTO drink_flavor_profiles (drink_id, sweetness, sourness, bitterness, saltiness, umami, spiciness, herbal, fruity, floral, smoky, complexity, intensity) VALUES
-- Old Fashioned
((SELECT drink_id FROM drinks WHERE name = 'Old Fashioned'), 6.0, 2.0, 4.0, 0.0, 0.0, 0.0, 2.0, 3.0, 0.0, 0.0, 3.0, 5.0),

-- Martini
((SELECT drink_id FROM drinks WHERE name = 'Martini'), 1.0, 1.0, 2.0, 0.0, 0.0, 0.0, 7.0, 0.0, 2.0, 0.0, 4.0, 6.0),

-- Daiquiri
((SELECT drink_id FROM drinks WHERE name = 'Daiquiri'), 4.0, 7.0, 1.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 2.0, 6.0),

-- Sidecar
((SELECT drink_id FROM drinks WHERE name = 'Sidecar'), 5.0, 6.0, 1.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 3.0, 6.0),

-- Whiskey Highball
((SELECT drink_id FROM drinks WHERE name = 'Whiskey Highball'), 1.0, 2.0, 3.0, 0.0, 0.0, 0.0, 2.0, 1.0, 0.0, 2.0, 2.0, 3.0),

-- Flip
((SELECT drink_id FROM drinks WHERE name = 'Flip'), 7.0, 1.0, 1.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 5.0),

-- Alexander
((SELECT drink_id FROM drinks WHERE name = 'Alexander'), 8.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 4.0),

-- Americano
((SELECT drink_id FROM drinks WHERE name = 'Americano'), 3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 4.0, 2.0, 1.0, 0.0, 4.0, 5.0);

