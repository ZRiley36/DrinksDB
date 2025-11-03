# DrinksDB

A cocktail database designed for exploring drinks through flavor profiles and ingredient relationships.

## Overview

DrinksDB is a PostgreSQL database that stores cocktail recipes with rich flavor profile data, enabling users to discover similar drinks based on taste preferences.

## Features

- **Drink Catalog**: Store cocktails with glassware, build methods, and garnishes
- **Ingredient Management**: Track ingredients with categories, subcategories, and ABV
- **Recipe Tracking**: Many-to-many relationships between drinks and ingredients with amounts
- **Flavor Profiles**: 12-dimensional flavor analysis (sweet, sour, bitter, herbal, fruity, etc.)
- **Similarity Search**: Find drinks with similar flavor profiles using SQL queries

## Database Schema

### Tables

- **drinks**: Basic drink information (name, glass, build method, garnish)
- **ingredients**: Ingredient catalog (name, category, subcategory, ABV)
- **drink_ingredients**: Recipe relationships with amounts and units
- **drink_flavor_profiles**: Multi-dimensional flavor ratings (0-10 scale)

## Setup

1. Ensure PostgreSQL is installed and running
2. Run the schema:
   ```bash
   psql -U your_username -d your_database -f commands.sql
   ```
3. Load sample data:
   ```bash
   psql -U your_username -d your_database -f seed_data.sql
   ```

## Usage

### Find similar drinks by flavor profile

```sql
-- Example: Find drinks similar to a Negroni
SELECT d.name, 
       fp.sweetness, fp.bitterness, fp.herbal,
       ABS(fp_negroni.sweetness - fp.sweetness) + 
       ABS(fp_negroni.bitterness - fp.bitterness) + 
       ABS(fp_negroni.herbal - fp.herbal) as similarity_score
FROM drinks d
JOIN drink_flavor_profiles fp ON d.drink_id = fp.drink_id
CROSS JOIN drink_flavor_profiles fp_negroni 
WHERE fp_negroni.drink_id = (SELECT drink_id FROM drinks WHERE name = 'Negroni')
  AND d.drink_id != fp_negroni.drink_id
ORDER BY similarity_score ASC
LIMIT 5;
```

### Filter drinks by flavor preferences

```sql
-- Find drinks that are sweet and not bitter
SELECT d.name, fp.sweetness, fp.bitterness
FROM drinks d
JOIN drink_flavor_profiles fp ON d.drink_id = fp.drink_id
WHERE fp.sweetness > 5 AND fp.bitterness < 3
ORDER BY fp.sweetness DESC;
```

## Data Source

Initial data compiled from personal cocktail research and classic recipes. Flavor profiles are placeholder estimates and should be refined based on actual tastings.

## License

MIT

## Contributing

Feel free to submit issues or pull requests!

