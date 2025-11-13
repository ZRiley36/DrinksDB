#!/usr/bin/env python3
"""
Parse cocktails_data.csv and generate SQL INSERT statements for DrinksDB.

The CSV format:
- name: Drink name
- ingredients: Semicolon-separated list like "30 ml White Rum; 30 ml Cognac"
- preparation: Instructions text
- url: Recipe URL
"""

import csv
import re
import sys
from collections import defaultdict
from typing import Dict, List, Set, Tuple, Optional


def escape_sql_string(s: Optional[str]) -> str:
    """Escape single quotes in SQL strings."""
    if s is None or s.strip() == '':
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"


def normalize_ingredient_name(name: str) -> str:
    """Normalize ingredient name capitalization and common variations."""
    if not name:
        return name
    
    # Title case, but preserve some common patterns
    name = name.strip()
    
    # Handle common abbreviations and proper nouns
    name = re.sub(r'\bml\b', 'ml', name, flags=re.IGNORECASE)
    name = re.sub(r'\bABV\b', 'ABV', name, flags=re.IGNORECASE)
    
    # Title case each word
    words = name.split()
    normalized_words = []
    for word in words:
        # Preserve all-caps abbreviations
        if word.isupper() and len(word) <= 4:
            normalized_words.append(word)
        else:
            # Title case but keep common words lowercase in the middle
            if word.lower() in ['de', 'of', 'or', 'and', 'the'] and normalized_words:
                normalized_words.append(word.lower())
            else:
                normalized_words.append(word.capitalize())
    
    normalized = ' '.join(normalized_words)
    
    # Common normalizations
    replacements = {
        r'\bFresh\s+lemon\s+juice\b': 'Fresh Lemon Juice',
        r'\bFresh\s+lime\s+juice\b': 'Fresh Lime Juice',
        r'\bFresh\s+orange\s+juice\b': 'Fresh Orange Juice',
        r'\bAngostura\s+bitters\b': 'Angostura Bitters',
        r'\bEgg\s+white\b': 'Egg White',
        r'\bEgg\s+yolk\b': 'Egg Yolk',
        r'\bSimple\s+syrup\b': 'Simple Syrup',
        r'\bSugar\s+syrup\b': 'Sugar Syrup',
    }
    
    for pattern, replacement in replacements.items():
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)
    
    return normalized


def parse_ingredient(ingredient_str: str) -> Optional[Tuple[str, str, str]]:
    """
    Parse an ingredient string like "30 ml White Rum" or "2 dashes Angostura Bitters"
    Returns (ingredient_name, amount, unit) or None if parsing fails.
    """
    ingredient_str = ingredient_str.strip()
    if not ingredient_str:
        return None
    
    # Skip items that are clearly not ingredients
    skip_patterns = [
        r'^\(optional\)$',
        r'^optional$',
        r'^few\s+drops?\s*$',
        r'^dash(es)?\s*$',
    ]
    for pattern in skip_patterns:
        if re.match(pattern, ingredient_str, re.IGNORECASE):
            return None
    
    # Handle "A dash of", "A pinch of", "A splash of" patterns first
    a_patterns = [
        (r'^a\s+dash\s+of\s+(.+)$', 'dash'),
        (r'^a\s+pinch\s+of\s+(.+)$', 'pinch'),
        (r'^a\s+splash\s+of\s+(.+)$', 'splash'),
        (r'^few\s+dashes?\s+(.+)$', 'dash'),
    ]
    for pattern, unit in a_patterns:
        match = re.match(pattern, ingredient_str, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            name = re.split(r'[;,]', name)[0].strip()
            name = normalize_ingredient_name(name)
            return (name, '1', unit)
    
    # Clean up common prefixes/suffixes
    ingredient_str = re.sub(r'^\d+ml\s+', '', ingredient_str, flags=re.IGNORECASE)  # Remove "30ml " prefix
    ingredient_str = re.sub(r'\s*\(optional\)\s*$', '', ingredient_str, flags=re.IGNORECASE)
    ingredient_str = ingredient_str.strip()
    
    # Pattern to match: amount (number or fraction) + unit + ingredient name
    # Check standard pattern FIRST before checking for concatenated ingredients
    patterns = [
        # Standard: "30 ml White Rum" or "30ml White Rum" - CHECK THIS FIRST!
        r'^(\d+(?:\.\d+)?)\s*(ml|oz|cl)\s+(.+)$',
        # Fraction with unit: "1/2 Bar Spoon Maraschino" or "1/2 Lemon Wheel"
        r'^(\d+/\d+)\s+(bar\s+spoon|bar\s+spoons?|lemon\s+wheel|orange\s+wheel|wheel)\s+(.+)$',
        r'^(\d+/\d+)\s+(.+)$',  # Fraction without explicit unit (like "1/2 Lemon Wheel")
        # Dash/drop: "2 Dashes Angostura Bitters" or "2 dashes Angostura Bitters"
        r'^(\d+)\s+(dashes?|drops?)\s+(.+)$',
        # Whole items: "1 Lime cut into small wedges" or "6 pcs Mint Leaves" or "5/6 Mint leaves"
        r'^(\d+(?:/\d+)?)\s+(whole|pcs?|pieces?|sprigs?|leaves?|wedges?|slices?|chunks?|quarter|quarters?)\s+(.+)$',
        # Teaspoon/tablespoon: "2 tsp White Cane Sugar" or "2 teaspoons White Cane Sugar"
        r'^(\d+(?:\.\d+)?)\s+(tsp|teaspoons?|tbsp|tablespoons?|bar\s+spoons?)\s+(.+)$',
        # Fill/top up: "Top up with Soda Water" or "Fill up with Cola"
        r'^(top\s+up|fill\s+up|fill)\s+(?:with\s+)?(.+)$',
        # Splash: "Splash of Soda Water"
        r'^(splash|few\s+drops?)\s+(?:of\s+)?(.+)$',
        # Bar spoon without fraction: "1 Bar Spoon Maraschino"
        r'^(\d+)\s+(bar\s+spoon|bar\s+spoons?)\s+(.+)$',
    ]
    
    for pattern in patterns:
        match = re.match(pattern, ingredient_str, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 3:
                amount, unit, name = groups
                # Clean up ingredient name
                name = re.split(r'[;,]', name)[0].strip()
                # Remove common descriptive phrases
                name = re.sub(r'\s+cut\s+into.*$', '', name, flags=re.IGNORECASE)
                name = re.sub(r'\s+\(.*\)$', '', name)  # Remove parenthetical notes
                name = re.sub(r'\s+to\s+serve\s+on\s+the\s+side.*$', '', name, flags=re.IGNORECASE)
                # Handle special case: "Lemon Wheel" or "Orange Wheel" when unit is "wheel"
                if unit.lower() in ['lemon wheel', 'orange wheel', 'wheel']:
                    if 'lemon' in unit.lower():
                        name = 'Lemon Wheel'
                    elif 'orange' in unit.lower():
                        name = 'Orange Wheel'
                    else:
                        name = name + ' Wheel' if not name.endswith('Wheel') else name
                    unit = 'wheel'
                name = normalize_ingredient_name(name)
                return (name, amount.strip(), unit.strip().lower())
            elif len(groups) == 2:
                # For "top up" or "splash" patterns, or fraction without unit
                first, second = groups
                # Check if first is a fraction
                if '/' in first:
                    # Fraction without unit - treat as amount, second is ingredient
                    name = re.split(r'[;,]', second)[0].strip()
                    name = normalize_ingredient_name(name)
                    return (name, first.strip(), 'pcs')
                else:
                    # For "top up" or "splash" patterns
                    unit_or_action, name = groups
                    name = re.split(r'[;,]', name)[0].strip()
                    name = normalize_ingredient_name(name)
                    if 'top' in unit_or_action.lower() or 'fill' in unit_or_action.lower():
                        return (name, 'top', 'up')
                    else:
                        return (name, 'splash', 'splash')
    
    # If no standard pattern matched, check for concatenated ingredients
    # (like "Allspice Saint Elizabeth15 ml Fresh Lime Juice")
    # This should only match if there's actual text before the number
    concat_match = re.match(r'^([A-Za-z][A-Za-z\s]+)(\d+(?:\.\d+)?)\s*(ml|oz|cl)\s+(.+)$', ingredient_str)
    if concat_match:
        # This might be two ingredients - take the second one
        amount, unit, name = concat_match.groups()[1:]
        name = re.split(r'[;,]', name)[0].strip()
        name = normalize_ingredient_name(name)
        return (name, amount.strip(), unit.strip().lower())
    
    # If no pattern matches, try to extract just the name (might be a whole item)
    # Check if it starts with a number
    num_match = re.match(r'^(\d+)\s+(.+)$', ingredient_str)
    if num_match:
        amount, name = num_match.groups()
        name = re.split(r'[;,]', name)[0].strip()
        name = normalize_ingredient_name(name)
        return (name, amount.strip(), 'pcs')
    
    # Last resort: treat the whole thing as ingredient name with default values
    # But clean it up first
    cleaned = re.split(r'[;,]', ingredient_str)[0].strip()
    cleaned = re.sub(r'\s*\(.*\)$', '', cleaned)  # Remove parenthetical notes
    cleaned = re.sub(r'\s+to\s+serve\s+on\s+the\s+side.*$', '', cleaned, flags=re.IGNORECASE)
    if cleaned and len(cleaned) > 2:  # Only return if it's a reasonable ingredient name
        cleaned = normalize_ingredient_name(cleaned)
        return (cleaned, '1', 'unit')
    
    return None


def infer_glass_type(preparation: str) -> str:
    """Infer glass type from preparation text."""
    prep_lower = preparation.lower()
    
    glass_keywords = {
        'Martini': ['martini', 'cocktail glass'],
        'Coupe': ['coupe', 'goblet'],
        'Rocks': ['rocks', 'old fashioned', 'old-fashioned'],
        'Highball': ['highball', 'collins', 'tumbler'],
        'Flute': ['flute', 'champagne'],
        'Hurricane': ['hurricane'],
        'Julep': ['julep'],
        'Copo': ['copo'],
    }
    
    for glass, keywords in glass_keywords.items():
        if any(keyword in prep_lower for keyword in keywords):
            return glass
    
    return 'NULL'  # Default if not found


def infer_build_method(preparation: str) -> str:
    """Infer build method from preparation text."""
    prep_lower = preparation.lower()
    
    if any(word in prep_lower for word in ['shake', 'shaker', 'shaken']):
        return 'Shaken'
    elif any(word in prep_lower for word in ['stir', 'stirred', 'mixing glass']):
        return 'Stirred'
    elif any(word in prep_lower for word in ['build', 'pour directly', 'fill']):
        return 'In Glass'
    elif any(word in prep_lower for word in ['blend', 'blender']):
        return 'Blended'
    else:
        return 'NULL'


def extract_garnish(preparation: str) -> str:
    """Try to extract garnish from preparation text."""
    # Look for common garnish mentions
    garnish_keywords = [
        'orange peel', 'lemon twist', 'lime wedge', 'cherry', 'olive',
        'nutmeg', 'mint', 'basil', 'lime wheel', 'lemon wheel',
        'orange slice', 'pineapple', 'celery'
    ]
    
    found_garnishes = []
    prep_lower = preparation.lower()
    
    for garnish in garnish_keywords:
        if garnish in prep_lower:
            found_garnishes.append(garnish.title())
    
    if found_garnishes:
        return ', '.join(found_garnishes)
    
    return 'NULL'


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


def generate_ingredients_sql(ingredients: Set[str]) -> str:
    """Generate SQL INSERT statements for ingredients."""
    sql = "-- Insert ingredients first (these will be referenced by drinks)\n"
    sql += "-- Note: Category, subcategory, and ABV are NULL - you may want to update these manually\n"
    sql += "INSERT INTO ingredients (name, category, subcategory, abv) VALUES\n"
    
    values = []
    for ingredient in sorted(ingredients):
        values.append(f"({escape_sql_string(ingredient)}, NULL, NULL, NULL)")
    
    sql += ",\n".join(values) + ";\n\n"
    return sql


def generate_drinks_sql(drinks: List[Dict]) -> str:
    """Generate SQL INSERT statements for drinks."""
    sql = "-- Insert drinks\n"
    sql += "INSERT INTO drinks (name, description, glass_type, build_method, garnish) VALUES\n"
    
    values = []
    for drink in drinks:
        name = escape_sql_string(drink['name'])
        description = escape_sql_string(drink.get('description', drink.get('preparation', ''))[:200])  # Limit description length
        glass_type = escape_sql_string(drink.get('glass_type', 'NULL'))
        build_method = escape_sql_string(drink.get('build_method', 'NULL'))
        garnish = escape_sql_string(drink.get('garnish', 'NULL'))
        
        values.append(f"({name}, {description}, {glass_type}, {build_method}, {garnish})")
    
    sql += ",\n".join(values) + ";\n\n"
    return sql


def generate_drink_ingredients_sql(drink_ingredients: List[Dict]) -> str:
    """Generate SQL INSERT statements for drink_ingredients relationships."""
    sql = "-- Insert drink_ingredients relationships\n"
    sql += "INSERT INTO drink_ingredients (drink_id, ingredient_id, amount, unit) VALUES\n"
    
    values = []
    for di in drink_ingredients:
        drink_name = escape_sql_string(di['drink_name'])
        ingredient_name = escape_sql_string(di['ingredient_name'])
        amount = escape_sql_string(di['amount'])
        unit = escape_sql_string(di['unit'])
        
        values.append(
            f"((SELECT drink_id FROM drinks WHERE name = {drink_name}), "
            f"(SELECT ingredient_id FROM ingredients WHERE name = {ingredient_name}), "
            f"{amount}, {unit})"
        )
    
    sql += ",\n".join(values) + ";\n\n"
    return sql


def main():
    if len(sys.argv) < 2:
        print("Usage: python parse_cocktails_csv.py <input_csv> [output_sql]")
        print("Example: python parse_cocktails_csv.py cocktails_data.csv seed_data.sql")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'seed_data.sql'
    
    print(f"Reading {input_file}...")
    rows = read_csv_file(input_file)
    
    print(f"Parsing {len(rows)} drinks...")
    
    drinks = []
    all_ingredients = {}  # Use dict to track canonical names
    drink_ingredients_list = []
    
    def get_canonical_name(name: str) -> str:
        """Get canonical ingredient name, merging similar variations."""
        normalized = normalize_ingredient_name(name)
        # Check if we already have a similar ingredient (case-insensitive)
        name_lower = normalized.lower()
        for existing in all_ingredients.keys():
            if existing.lower() == name_lower:
                return existing
        # If not found, add it and return the normalized version
        all_ingredients[normalized] = True
        return normalized
    
    for row in rows:
        drink_name = row['name'].strip()
        ingredients_str = row.get('ingredients', '').strip()
        preparation = row.get('preparation', '').strip()
        
        # Parse drink info
        glass_type = infer_glass_type(preparation)
        build_method = infer_build_method(preparation)
        garnish = extract_garnish(preparation)
        
        drinks.append({
            'name': drink_name,
            'description': preparation[:200] if preparation else None,  # Use preparation as description
            'glass_type': glass_type if glass_type != 'NULL' else None,
            'build_method': build_method if build_method != 'NULL' else None,
            'garnish': garnish if garnish != 'NULL' else None
        })
        
        # Parse ingredients
        if ingredients_str:
            ingredient_parts = [p.strip() for p in ingredients_str.split(';')]
            for ingredient_part in ingredient_parts:
                if not ingredient_part:  # Skip empty parts
                    continue
                parsed = parse_ingredient(ingredient_part)
                if parsed:
                    ingredient_name, amount, unit = parsed
                    # Get canonical name (handles duplicates)
                    canonical_name = get_canonical_name(ingredient_name)
                    drink_ingredients_list.append({
                        'drink_name': drink_name,
                        'ingredient_name': canonical_name,
                        'amount': amount,
                        'unit': unit
                    })
                else:
                    print(f"Warning: Could not parse ingredient '{ingredient_part}' for {drink_name}", file=sys.stderr)
    
    # Generate SQL
    sql_output = "-- Sample data insert statements parsed from cocktails_data.csv\n"
    sql_output += "-- Note: Ingredient categories, subcategories, and ABV are NULL - update manually if needed\n"
    sql_output += "-- Note: Flavor profiles are not included - add separately if needed\n\n"
    
    sql_output += generate_ingredients_sql(set(all_ingredients.keys()))
    sql_output += generate_drinks_sql(drinks)
    sql_output += generate_drink_ingredients_sql(drink_ingredients_list)
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_output)
    
    print(f"\n✓ Generated {output_file}")
    print(f"  - {len(drinks)} drinks")
    print(f"  - {len(all_ingredients)} unique ingredients")
    print(f"  - {len(drink_ingredients_list)} drink-ingredient relationships")
    print(f"\nNote: You may want to:")
    print(f"  1. Update ingredient categories, subcategories, and ABV values")
    print(f"  2. Add flavor profiles for the drinks")
    print(f"  3. Review and adjust glass types, build methods, and garnishes")


if __name__ == '__main__':
    main()

