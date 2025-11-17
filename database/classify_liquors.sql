-- Classify Liquor Ingredients
-- This script updates ingredients to set category='Liquor' and appropriate subcategories
-- Subcategories: Whiskey, Gin, Vodka, Rum, Tequila, Mezcal, Brandy, Cognac, Cachaça, Pisco, etc.

-- WHISKEY (including all whiskey/whisky variants)
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Whiskey'
WHERE LOWER(name) LIKE '%whiskey%' 
   OR LOWER(name) LIKE '%whisky%'
   OR name IN ('Bourbon Whiskey', 'Rye Whiskey', 'Irish Whiskey', 'Blended Scotch Whisky', 'Scotch Whisky', 
               'Bourbon or Rye Whiskey', 'Rye Whiskey or Bourbon', 'Lagavulin 16y');

-- GIN
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Gin'
WHERE LOWER(name) LIKE '%gin%'
   OR name IN ('Gin', 'Dry Gin', 'London Dry Gin', 'Old Tom Gin');

-- VODKA
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Vodka'
WHERE LOWER(name) LIKE '%vodka%'
   OR name IN ('Vodka', 'Smirnoff Vodka', 'Vanilla Vodka', 'Vodka Citron', 'Vodka Vanilla');

-- RUM
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Rum'
WHERE LOWER(name) LIKE '%rum%'
   OR LOWER(name) LIKE '%rhum%'
   OR name IN ('Rum', 'Aged Rum', 'White Rum', 'Blackstrap Rum', 'Blended Aged Rum',
               'Amber Jamaican Rum', 'Gold Jamaican Rum', 'Gold Puerto Rican Rum', 
               'Jamaican Rum', 'Jamaican Dark Rum', 'Jamaica Overproof White Rum',
               'Cuban Rum', 'Demerara Rum', 'Goslings Rum',
               'White Cuban Ron', 'Ron Profundo Havana Club', 'Ron Smoky Havana Club',
               'Martinique Molasses Rhum*', 'Rhum Martinique Agricole');

-- TEQUILA
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Tequila'
WHERE LOWER(name) LIKE '%tequila%'
   OR name IN ('Tequila', '100% Agave Tequila', 'Tequila 100% Agave');

-- MEZCAL
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Mezcal'
WHERE LOWER(name) LIKE '%mezcal%'
   OR name IN ('Mezcal', 'Espadin Mezcal');

-- BRANDY (including fruit brandies)
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Brandy'
WHERE (LOWER(name) LIKE '%brandy%' AND LOWER(name) NOT LIKE '%cognac%')
   OR name IN ('Brandy', 'Apricot Brandy', 'Peach Brandy', 'Cherry Brandy Luxardo');

-- COGNAC
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Cognac'
WHERE (LOWER(name) LIKE '%cognac%' AND LOWER(name) NOT LIKE '%brandy%')
   OR name = 'Cognac';

-- Handle compound ingredients (these can be either/or, so we'll classify them as the first type)
UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Cognac'
WHERE name = 'Cognac or Brandy';

UPDATE ingredients 
SET category = 'Liquor', subcategory = 'Whiskey'
WHERE name IN ('Bourbon or Rye Whiskey', 'Rye Whiskey or Bourbon');

-- Verify the updates
SELECT name, category, subcategory 
FROM ingredients 
WHERE category = 'Liquor'
ORDER BY subcategory, name;

