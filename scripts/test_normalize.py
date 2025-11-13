#!/usr/bin/env python3
"""Test the normalization function"""

STANDARD_MEASUREMENTS = {
    0.17: '1/6',
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.75: '3/4',
    1.0: '1',
    1.5: '1 1/2',
    2.0: '2',
}

TOLERANCE = 0.08

def find_closest_standard(value):
    """Find the closest standard measurement."""
    try:
        num_value = float(value)
    except (ValueError, TypeError):
        return value
    
    if num_value in STANDARD_MEASUREMENTS:
        return STANDARD_MEASUREMENTS[num_value]
    
    closest = min(STANDARD_MEASUREMENTS.keys(), key=lambda x: abs(x - num_value))
    difference = abs(num_value - closest)
    
    if difference < TOLERANCE:
        return STANDARD_MEASUREMENTS[closest]
    
    # Special cases
    if 0.60 <= num_value <= 0.70:
        return '3/4'
    
    if 1.60 <= num_value <= 1.75:
        return '1 1/2'
    
    if 0.20 <= num_value <= 0.30:
        return '1/4'
    
    return STANDARD_MEASUREMENTS[closest]

# Test cases
test_values = ['1.67', '0.67', '0.50', '1.50', '0.25', '2.0', '1.0']
for val in test_values:
    result = find_closest_standard(val)
    print(f"{val} -> {result}")

