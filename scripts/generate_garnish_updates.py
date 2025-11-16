import csv
import os

# Read the CSV file
csv_path = os.path.join('..', 'database', 'cocktails_data (1).csv')
sql_path = os.path.join('..', 'database', 'update_garnishes.sql')

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    updates = []
    for row in reader:
        name = row['name'].strip()
        garnish = row['garnish'].strip()
        
        # Skip if garnish is N/A, empty, or "N/A."
        garnish_upper = garnish.upper()
        if garnish_upper in ['N/A', 'N/A.', ''] or garnish_upper.startswith('N/A'):
            continue
        
        # Clean up the garnish text - remove "Garnish with" prefix if present
        garnish_clean = garnish
        if garnish_clean.lower().startswith('garnish with '):
            garnish_clean = garnish_clean[13:].strip()
        elif garnish_clean.lower().startswith('garnish '):
            garnish_clean = garnish_clean[8:].strip()
        
        # Replace newlines with spaces for SQL compatibility
        garnish_clean = garnish_clean.replace('\n', ' ').replace('\r', ' ')
        # Collapse multiple spaces
        while '  ' in garnish_clean:
            garnish_clean = garnish_clean.replace('  ', ' ')
        garnish_clean = garnish_clean.strip()
        
        # Escape single quotes for SQL
        garnish_clean = garnish_clean.replace("'", "''")
        name_clean = name.replace("'", "''")
        
        # Create UPDATE statement
        update_stmt = f"UPDATE drinks SET garnish = '{garnish_clean}' WHERE LOWER(name) = LOWER('{name_clean}');"
        updates.append(update_stmt)

# Write to SQL file
with open(sql_path, 'w', encoding='utf-8') as f:
    f.write("-- UPDATE statements to add garnishes to existing drinks\n")
    f.write("-- Generated from cocktails_data (1).csv\n\n")
    for update in updates:
        f.write(update + '\n')
    
    f.write(f"\n-- Total updates: {len(updates)}\n")

print(f"Generated {len(updates)} UPDATE statements in {sql_path}")

