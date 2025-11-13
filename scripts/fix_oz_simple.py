#!/usr/bin/env python3
"""Simple script to fix oz measurements"""

import re

# Conversion map based on user's reference
conversions = {
    '1.67': '1 1/2',  # 50ml -> 45ml (1.5oz)
    '0.67': '3/4',    # 20ml -> 22.5ml (0.75oz)
    '0.50': '1/2',    # 15ml = 0.5oz
    '1.50': '1 1/2',  # 45ml = 1.5oz
    '0.25': '1/4',    # 7.5ml = 0.25oz
    '0.33': '1/3',    # 10ml ≈ 0.33oz
    '0.17': '1/6',    # 5ml = 0.17oz (1 tsp)
}

def fix_oz_file(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # First, fix any incorrectly added parentheses: ('value', 'oz') -> 'value', 'oz')
    content = re.sub(r"\('([^']+)', 'oz'\)", r"'\1', 'oz')", content)
    
    # Replace each decimal value with its standard measurement
    for decimal, standard in conversions.items():
        # Match: 'decimal', 'oz')
        pattern = f"'{re.escape(decimal)}', 'oz'"
        replacement = f"'{standard}', 'oz'"
        content = re.sub(pattern, replacement, content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fixed oz measurements in {output_file}")

if __name__ == '__main__':
    fix_oz_file('../database/seed_data_new.sql', '../database/seed_data_new.sql')

