#!/usr/bin/env python3
"""
Convert Google Sheets CSV exports to SQL INSERT statements for DrinksDB.

Usage:
    python csv_to_sql.py --drinks drinks.csv --ingredients drink_ingredients.csv --flavors flavor_profiles.csv --output seed_data.sql

Or with separate ingredients file:
    python csv_to_sql.py --drinks drinks.csv --ingredients drink_ingredients.csv --ingredient-catalog ingredients.csv --flavors flavor_profiles.csv --output seed_data.sql
"""

import csv
import argparse
import sys
from collections import defaultdict
from typing import Dict, List, Set, Optional


def escape_sql_string(s: Optional[str]) -> str:
    """Escape single quotes in SQL strings."""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"


def read_csv_file(filename: str) -> List[Dict[str, str]]:
    """Read a CSV file and return a list of dictionaries."""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading '{filename}': {e}", file=sys.stderr)
        sys.exit(1)


def generate_ingredients_sql(ingredients: Set[str], ingredient_catalog: Optional[Dict[str, Dict]] = None) -> str:
    """Generate SQL INSERT statements for ingredients."""
    sql = "-- Insert ingredients first (these will be referenced by drinks)\n"
    sql += "INSERT INTO ingredients (name, category, subcategory, abv) VALUES\n"
    
    values = []
    for ingredient in sorted(ingredients):
        if ingredient_catalog and ingredient in ingredient_catalog:
            cat = ingredient_catalog[ingredient]
            category = escape_sql_string(cat.get('category', 'NULL'))
            subcategory = escape_sql_string(cat.get('subcategory', 'NULL'))
            abv = cat.get('abv', 'NULL')
            if abv != 'NULL':
                try:
                    abv = f"{float(abv):.2f}"
                except (ValueError, TypeError):
                    abv = 'NULL'
        else:
            category = 'NULL'
            subcategory = 'NULL'
            abv = 'NULL'
        
        values.append(f"({escape_sql_string(ingredient)}, {category}, {subcategory}, {abv})")
    
    sql += ",\n".join(values) + ";\n\n"
    return sql


def generate_drinks_sql(drinks: List[Dict[str, str]]) -> str:
    """Generate SQL INSERT statements for drinks."""
    sql = "-- Insert drinks\n"
    sql += "INSERT INTO drinks (name, description, glass_type, build_method, garnish) VALUES\n"
    
    values = []
    for drink in drinks:
        name = escape_sql_string(drink.get('name', ''))
        description = escape_sql_string(drink.get('description'))
        glass_type = escape_sql_string(drink.get('glass_type'))
        build_method = escape_sql_string(drink.get('build_method'))
        garnish = escape_sql_string(drink.get('garnish'))
        
        values.append(f"({name}, {description}, {glass_type}, {build_method}, {garnish})")
    
    sql += ",\n".join(values) + ";\n\n"
    return sql


def generate_drink_ingredients_sql(drink_ingredients: List[Dict[str, str]]) -> str:
    """Generate SQL INSERT statements for drink_ingredients relationships."""
    sql = "-- Insert drink_ingredients relationships\n"
    sql += "INSERT INTO drink_ingredients (drink_id, ingredient_id, amount, unit) VALUES\n"
    
    values = []
    for di in drink_ingredients:
        drink_name = escape_sql_string(di.get('drink_name', ''))
        ingredient_name = escape_sql_string(di.get('ingredient_name', ''))
        amount = escape_sql_string(di.get('amount', ''))
        unit = escape_sql_string(di.get('unit', ''))
        
        values.append(
            f"((SELECT drink_id FROM drinks WHERE name = {drink_name}), "
            f"(SELECT ingredient_id FROM ingredients WHERE name = {ingredient_name}), "
            f"{amount}, {unit})"
        )
    
    sql += ",\n".join(values) + ";\n\n"
    return sql


def generate_flavor_profiles_sql(flavor_profiles: List[Dict[str, str]]) -> str:
    """Generate SQL INSERT statements for drink_flavor_profiles."""
    sql = "-- Insert flavor profiles\n"
    sql += "INSERT INTO drink_flavor_profiles (drink_id, sweetness, sourness, bitterness, saltiness, umami, spiciness, herbal, fruity, floral, smoky, complexity, intensity) VALUES\n"
    
    flavor_fields = ['sweetness', 'sourness', 'bitterness', 'saltiness', 'umami', 
                     'spiciness', 'herbal', 'fruity', 'floral', 'smoky', 'complexity', 'intensity']
    
    values = []
    for fp in flavor_profiles:
        drink_name = escape_sql_string(fp.get('drink_name', ''))
        flavor_values = []
        for field in flavor_fields:
            value = fp.get(field, '0')
            try:
                # Validate it's a number between 0-10
                num = float(value)
                if num < 0 or num > 10:
                    print(f"Warning: {field} for {fp.get('drink_name')} is {num}, should be 0-10. Using 0.", file=sys.stderr)
                    num = 0
                flavor_values.append(f"{num:.1f}")
            except (ValueError, TypeError):
                flavor_values.append("0.0")
        
        values.append(
            f"((SELECT drink_id FROM drinks WHERE name = {drink_name}), "
            f"{', '.join(flavor_values)})"
        )
    
    sql += ",\n".join(values) + ";\n\n"
    return sql


def main():
    parser = argparse.ArgumentParser(
        description='Convert Google Sheets CSV exports to SQL INSERT statements for DrinksDB'
    )
    parser.add_argument('--drinks', required=True, help='CSV file with drinks data')
    parser.add_argument('--ingredients', required=True, help='CSV file with drink_ingredients relationships')
    parser.add_argument('--ingredient-catalog', help='Optional CSV file with ingredient catalog (category, subcategory, abv)')
    parser.add_argument('--flavors', help='Optional CSV file with flavor profiles')
    parser.add_argument('--output', default='seed_data.sql', help='Output SQL file (default: seed_data.sql)')
    
    args = parser.parse_args()
    
    # Read CSV files
    drinks = read_csv_file(args.drinks)
    drink_ingredients = read_csv_file(args.ingredients)
    
    # Collect all unique ingredients from drink_ingredients
    all_ingredients = set()
    for di in drink_ingredients:
        ingredient_name = di.get('ingredient_name', '').strip()
        if ingredient_name:
            all_ingredients.add(ingredient_name)
    
    # Read ingredient catalog if provided
    ingredient_catalog = None
    if args.ingredient_catalog:
        catalog_data = read_csv_file(args.ingredient_catalog)
        ingredient_catalog = {}
        for row in catalog_data:
            name = row.get('name', '').strip()
            if name:
                ingredient_catalog[name] = {
                    'category': row.get('category', '').strip() or None,
                    'subcategory': row.get('subcategory', '').strip() or None,
                    'abv': row.get('abv', '').strip() or None
                }
    
    # Read flavor profiles if provided
    flavor_profiles = []
    if args.flavors:
        flavor_profiles = read_csv_file(args.flavors)
    
    # Generate SQL
    sql_output = "-- Sample data insert statements based on Google Sheets data\n"
    sql_output += "-- Note: Flavor profiles are placeholder estimates and should be refined based on actual tastings\n\n"
    
    sql_output += generate_ingredients_sql(all_ingredients, ingredient_catalog)
    sql_output += generate_drinks_sql(drinks)
    sql_output += generate_drink_ingredients_sql(drink_ingredients)
    
    if flavor_profiles:
        sql_output += generate_flavor_profiles_sql(flavor_profiles)
    
    # Write output
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(sql_output)
    
    print(f"✓ Generated {args.output}")
    print(f"  - {len(drinks)} drinks")
    print(f"  - {len(all_ingredients)} ingredients")
    print(f"  - {len(drink_ingredients)} drink-ingredient relationships")
    if flavor_profiles:
        print(f"  - {len(flavor_profiles)} flavor profiles")


if __name__ == '__main__':
    main()

