-- Query to find all ingredient names for a given drink
-- Replace 'Old Fashioned' with the drink name you want to search for

SELECT 
    d.name AS drink_name,
    i.name AS ingredient_name,
    di.amount,
    di.unit
FROM drinks d
JOIN drink_ingredients di ON d.drink_id = di.drink_id
JOIN ingredients i ON di.ingredient_id = i.ingredient_id
WHERE d.name = 'Old Fashioned'  -- Change this to the drink name you want
ORDER BY i.name;

-- Alternative: Just get ingredient names (simpler output)
-- SELECT i.name AS ingredient_name
-- FROM drinks d
-- JOIN drink_ingredients di ON d.drink_id = di.drink_id
-- JOIN ingredients i ON di.ingredient_id = i.ingredient_id
-- WHERE d.name = 'Old Fashioned'
-- ORDER BY i.name;

-- Alternative: Case-insensitive search (useful if you're not sure of exact capitalization)
-- SELECT 
--     d.name AS drink_name,
--     i.name AS ingredient_name,
--     di.amount,
--     di.unit
-- FROM drinks d
-- JOIN drink_ingredients di ON d.drink_id = di.drink_id
-- JOIN ingredients i ON di.ingredient_id = i.ingredient_id
-- WHERE LOWER(d.name) = LOWER('old fashioned')  -- Case-insensitive
-- ORDER BY i.name;

