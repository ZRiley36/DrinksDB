#!/usr/bin/env python3
"""Fix double parentheses in SQL file"""

import re

def fix_parentheses(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix double closing parentheses: 'value', 'oz')) -> 'value', 'oz')
    # This pattern matches: ), 'value', 'oz')) and replaces with ), 'value', 'oz')
    pattern = r"('oz')(\)\))"
    replacement = r"\1)"
    content = re.sub(pattern, replacement, content)
    
    # Also fix any other double closing parens that might have been introduced
    # Match: ), 'value', 'unit')) where unit is any unit
    pattern2 = r"('(?:oz|ml|dash|dashes|barspoon|bar spoon|pcs|whole|splash|pinch)')\)\)"
    replacement2 = r"\1)"
    content = re.sub(pattern2, replacement2, content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fixed double parentheses in {output_file}")
    
    # Count how many were fixed
    double_parens_before = len(re.findall(r"'oz'\)\)", content))
    print(f"  - Removed double closing parentheses")

if __name__ == '__main__':
    import os
    # Get the script directory and go up one level
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    sql_file = os.path.join(project_root, 'database', 'seed_data_new.sql')
    fix_parentheses(sql_file, sql_file)

