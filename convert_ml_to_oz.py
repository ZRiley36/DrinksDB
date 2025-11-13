#!/usr/bin/env python3
"""
Convert ml measurements to oz in seed_data_new.sql
- 30 ml = 1 oz (simplified conversion)
- 5 ml = 1 barspoon
"""

import re

def convert_ml_to_oz(amount_str, unit):
    """Convert ml amount to oz or barspoon."""
    if unit.lower() != 'ml':
        return amount_str, unit
    
    try:
        amount = float(amount_str)
    except ValueError:
        return amount_str, unit
    
    # Special case: 5 ml = 1 barspoon
    if amount == 5.0:
        return '1', 'barspoon'
    
    # Convert: 30 ml = 1 oz
    oz_amount = amount / 30.0
    
    # Round to 2 decimal places, but if it's a whole number, use integer
    if oz_amount == int(oz_amount):
        return str(int(oz_amount)), 'oz'
    else:
        return f"{oz_amount:.2f}", 'oz'

def convert_sql_file(input_file, output_file):
    """Convert ml to oz in SQL INSERT statements."""
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match: 'amount', 'ml')
    # Match: '45', 'ml') or '52.5', 'ml')
    # The pattern needs to match: quote, number, quote comma space quote, 'ml', closing paren
    pattern = r"(')(\d+(?:\.\d+)?)('\s*,\s*')('ml')(\))"
    
    def replace_ml(match):
        quote1 = match.group(1)  # Opening quote
        amount = match.group(2)   # The amount
        quote_comma = match.group(3)   # Closing quote, comma, space, opening quote  
        unit_quote = match.group(4)     # 'ml'
        closing_paren = match.group(5)   # Closing paren
        
        new_amount, new_unit = convert_ml_to_oz(amount, 'ml')
        return f"{quote1}{new_amount}{quote_comma}'{new_unit}'{closing_paren}"
    
    # Count before
    ml_before = len(re.findall(r"'ml'", content))
    
    # Replace all ml measurements
    converted_content = re.sub(pattern, replace_ml, content)
    
    # Debug: check if any replacements happened
    if ml_before > 0 and "'ml'" in converted_content:
        # Try a different pattern - maybe there are spaces
        pattern2 = r"('\s*)(\d+(?:\.\d+)?)(\s*',\s*')('ml')(\))"
        converted_content = re.sub(pattern2, lambda m: f"{m.group(1)}{convert_ml_to_oz(m.group(2), 'ml')[0]}{m.group(3)}'{convert_ml_to_oz(m.group(2), 'ml')[1]}'{m.group(5)}", converted_content)
    
    # If still not working, try simpler pattern
    if "'ml'" in converted_content:
        # Very simple: find 'number', 'ml') and replace
        def replace_simple(m):
            full_match = m.group(0)
            # Extract the number
            num_match = re.search(r"'(\d+(?:\.\d+)?)'", full_match)
            if num_match:
                amount = num_match.group(1)
                new_amount, new_unit = convert_ml_to_oz(amount, 'ml')
                return full_match.replace(f"'{amount}'", f"'{new_amount}'").replace("'ml'", f"'{new_unit}'")
            return full_match
        
        # Match the whole pattern: 'number', 'ml')
        simple_pattern = r"'\d+(?:\.\d+)?'\s*,\s*'ml'\)"
        converted_content = re.sub(simple_pattern, replace_simple, converted_content)
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(converted_content)
    
    print(f"✓ Converted {input_file} -> {output_file}")
    
    # Count conversions
    ml_count = len(re.findall(r"'ml'", content))
    oz_count = len(re.findall(r"'oz'", converted_content))
    barspoon_count = len(re.findall(r"'barspoon'", converted_content))
    
    print(f"  - Found {ml_count} ml measurements")
    print(f"  - Converted to {oz_count} oz measurements")
    print(f"  - Converted {barspoon_count} to barspoon (5ml)")

if __name__ == '__main__':
    convert_sql_file('seed_data_new.sql', 'seed_data_new.sql')

