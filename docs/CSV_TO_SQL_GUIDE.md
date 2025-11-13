# Google Sheets to SQL Conversion Guide

This guide explains how to populate your DrinksDB using Google Sheets and the conversion script.

## Workflow Overview

1. **Create Google Sheets** with your drink data
2. **Export as CSV** files
3. **Run the conversion script** to generate SQL
4. **Import the SQL** into your database

## Google Sheets Structure

You'll need to create **3-4 sheets/tabs** in Google Sheets:

### 1. Drinks Sheet

Columns:
- `name` (required) - Drink name
- `description` (optional) - Description of the drink
- `glass_type` (optional) - e.g., "Rocks", "Martini", "Coupe", "Highball"
- `build_method` (optional) - e.g., "Stirred", "Shaken", "In Glass"
- `garnish` (optional) - e.g., "Orange Peel, Cherry"

### 2. Drink Ingredients Sheet

This is where you list all ingredients for each drink. Each row is one ingredient for one drink.

Columns:
- `drink_name` (required) - Must match the drink name from the Drinks sheet
- `ingredient_name` (required) - Name of the ingredient
- `amount` (required) - Amount as a number or text (e.g., "2", "0.25", "2")
- `unit` (required) - Unit (e.g., "oz", "ml", "dash", "tsp", "whole")

**Example:** If a drink has 3 ingredients, you'll have 3 rows with the same `drink_name`.

### 3. Flavor Profiles Sheet (Optional)

Columns:
- `drink_name` (required) - Must match the drink name from the Drinks sheet
- `sweetness` (0-10 scale)
- `sourness` (0-10 scale)
- `bitterness` (0-10 scale)
- `saltiness` (0-10 scale)
- `umami` (0-10 scale)
- `spiciness` (0-10 scale)
- `herbal` (0-10 scale)
- `fruity` (0-10 scale)
- `floral` (0-10 scale)
- `smoky` (0-10 scale)
- `complexity` (0-10 scale)
- `intensity` (0-10 scale)

### 4. Ingredients Catalog Sheet (Optional)

If you want to pre-define ingredient categories and ABV values:

Columns:
- `name` (required) - Ingredient name
- `category` (optional) - e.g., "Spirit", "Liqueur", "Juice"
- `subcategory` (optional) - e.g., "Whiskey", "Amaro", "Citrus"
- `abv` (optional) - Alcohol by volume (e.g., 40.00)

**Note:** If you don't provide this sheet, ingredients will be auto-detected from the Drink Ingredients sheet, but they'll have NULL values for category, subcategory, and ABV.

## Step-by-Step Instructions

### Step 1: Set Up Google Sheets

1. Create a new Google Sheet
2. Create tabs/sheets for:
   - "Drinks"
   - "Drink Ingredients"
   - "Flavor Profiles" (optional)
   - "Ingredients Catalog" (optional)
3. Add the column headers as described above
4. Fill in your data

### Step 2: Export as CSV

1. For each sheet/tab:
   - Click on the sheet tab
   - Go to **File → Download → Comma-separated values (.csv)**
   - Save with descriptive names:
     - `drinks.csv`
     - `drink_ingredients.csv`
     - `flavor_profiles.csv` (if you created it)
     - `ingredients.csv` (if you created it)

### Step 3: Run the Conversion Script

Place your CSV files in the same directory as `csv_to_sql.py`, then run:

**Basic usage (without flavor profiles or ingredient catalog):**
```bash
python csv_to_sql.py --drinks drinks.csv --ingredients drink_ingredients.csv --output seed_data.sql
```

**With flavor profiles:**
```bash
python csv_to_sql.py --drinks drinks.csv --ingredients drink_ingredients.csv --flavors flavor_profiles.csv --output seed_data.sql
```

**Full usage (with everything):**
```bash
python csv_to_sql.py --drinks drinks.csv --ingredients drink_ingredients.csv --ingredient-catalog ingredients.csv --flavors flavor_profiles.csv --output seed_data.sql
```

### Step 4: Import into Database

```bash
psql -U your_username -d your_database -f seed_data.sql
```

## Tips

1. **Consistent naming**: Make sure drink names match exactly between the Drinks sheet and Drink Ingredients sheet (case-sensitive)

2. **Ingredient names**: Use consistent ingredient names (e.g., always "Gin" not sometimes "Gin" and sometimes "gin")

3. **Missing data**: Empty cells are fine - they'll become NULL in the database

4. **Special characters**: The script handles single quotes and other special characters automatically

5. **Validation**: The script validates flavor profile values (must be 0-10) and warns about invalid values

## Example Files

See the `example_*.csv` files in this directory for reference on the expected format.

