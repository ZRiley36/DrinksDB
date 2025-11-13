#!/usr/bin/env python3
"""
Normalize oz measurements to standard cocktail measurements.
Converts decimal oz values to common cocktail measurements.
"""

import re

# Standard cocktail measurements in oz (based on user's reference)
# Key: decimal value, Value: display string
STANDARD_MEASUREMENTS = {
    0.17: '1/6',  # 1 teaspoon (5ml)
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',   # 15ml
    0.75: '3/4',  # 22.5ml
    1.0: '1',     # 30ml
    1.5: '1 1/2', # 45ml
    2.0: '2',     # 60ml
}

# Tolerance for matching (within 0.08 oz to allow rounding)
TOLERANCE = 0.08

def find_closest_standard(value):
    """Find the closest standard measurement."""
    try:
        num_value = float(value)
    except (ValueError, TypeError):
        return value
    
    # Check if it's already a standard measurement (exact match)
    if num_value in STANDARD_MEASUREMENTS:
        return STANDARD_MEASUREMENTS[num_value]
    
    # Find closest standard measurement
    closest = min(STANDARD_MEASUREMENTS.keys(), key=lambda x: abs(x - num_value))
    difference = abs(num_value - closest)
    
    # If within tolerance, use the standard measurement
    if difference < TOLERANCE:
        return STANDARD_MEASUREMENTS[closest]
    
    # Special cases for common conversions:
    # 0.67 oz (20ml) -> 0.75 oz (closer to 22.5ml than 15ml)
    if 0.60 <= num_value <= 0.70:
        return '3/4'
    
    # 1.67 oz (50ml) -> 1.5 oz (closer to 45ml)
    if 1.60 <= num_value <= 1.75:
        return '1 1/2'
    
    # 0.25 oz (7.5ml) -> 1/4 oz
    if 0.20 <= num_value <= 0.30:
        return '1/4'
    
    # If still no match, round to closest standard
    return STANDARD_MEASUREMENTS[closest]

def normalize_sql_file(input_file, output_file):
    """Normalize oz measurements in SQL INSERT statements."""
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match: 'amount', 'oz')
    # Match: '1.67', 'oz') or '0.50', 'oz')
    pattern = r"(')(\d+(?:\.\d+)?)('\s*,\s*')('oz')(\))"
    
    def replace_oz(match):
        quote1 = match.group(1)
        amount = match.group(2)
        quote_comma = match.group(3)
        unit_quote = match.group(4)
        closing_paren = match.group(5)
        
        normalized_amount = find_closest_standard(amount)
        
        return f"{quote1}{normalized_amount}{quote_comma}'{unit_quote}'{closing_paren}"
    
    # Replace all oz measurements
    converted_content = re.sub(pattern, replace_oz, content)
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(converted_content)
    
    print(f"✓ Normalized {input_file} -> {output_file}")
    
    # Count changes
    oz_before = len(re.findall(r"'oz'", content))
    oz_after = len(re.findall(r"'oz'", converted_content))
    
    print(f"  - Found {oz_before} oz measurements")
    print(f"  - Normalized to standard cocktail measurements")

if __name__ == '__main__':
    normalize_sql_file('../database/seed_data_new.sql', '../database/seed_data_new.sql')

