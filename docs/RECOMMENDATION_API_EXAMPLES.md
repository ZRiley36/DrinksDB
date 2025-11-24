# Recommendation API Examples

## Quick Start

Two recommendation endpoints are now available in your backend:

### 1. Get Similar Drinks (Content-Based)

**Endpoint:** `GET /api/drinks/:name/recommendations`

**Example:**
```javascript
// Frontend example
const getRecommendations = async (drinkName) => {
  const response = await fetch(
    `http://localhost:3001/api/drinks/${encodeURIComponent(drinkName)}/recommendations?limit=5`
  );
  const recommendations = await response.json();
  return recommendations;
};

// Usage
const similarDrinks = await getRecommendations('Margarita');
console.log(similarDrinks);
// Returns: [
//   {
//     drink_id: 42,
//     name: "Tequila Sunrise",
//     glass_type: "Highball",
//     build_method: "In Glass",
//     garnish: "orange slice",
//     common_ingredients: 2,
//     total_ingredients: 4,
//     similarity_score: 50.00
//   },
//   ...
// ]
```

**cURL Example:**
```bash
curl "http://localhost:3001/api/drinks/Margarita/recommendations?limit=5"
```

### 2. Recommend by Available Ingredients

**Endpoint:** `POST /api/recommendations/by-ingredients`

**Example with ingredient IDs:**
```javascript
const getRecommendationsByIngredients = async (ingredientIds) => {
  const response = await fetch('http://localhost:3001/api/recommendations/by-ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredient_ids: ingredientIds,
      min_match_percentage: 50  // Optional, default is 50%
    })
  });
  return await response.json();
};

// Usage
const recommendations = await getRecommendationsByIngredients([1, 5, 12, 23]);
```

**Example with ingredient names:**
```javascript
const getRecommendationsByIngredientNames = async (ingredientNames) => {
  const response = await fetch('http://localhost:3001/api/recommendations/by-ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredient_names: ingredientNames,
      min_match_percentage: 75  // Only show drinks where 75%+ ingredients match
    })
  });
  return await response.json();
};

// Usage
const recommendations = await getRecommendationsByIngredientNames([
  'Tequila',
  'Triple Sec',
  'Fresh Lime Juice'
]);
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/recommendations/by-ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "ingredient_names": ["Tequila", "Triple Sec", "Fresh Lime Juice"],
    "min_match_percentage": 50
  }'
```

**Response Format:**
```json
[
  {
    "drink_id": 15,
    "name": "Margarita",
    "glass_type": "Rocks",
    "build_method": "Shaken",
    "garnish": "lime wheel",
    "matched_ingredients": 3,
    "total_ingredients": 3,
    "match_percentage": 100.00,
    "missing_ingredients": []
  },
  {
    "drink_id": 42,
    "name": "Tequila Sunrise",
    "glass_type": "Highball",
    "build_method": "In Glass",
    "garnish": "orange slice",
    "matched_ingredients": 1,
    "total_ingredients": 3,
    "match_percentage": 33.33,
    "missing_ingredients": ["Fresh Orange Juice", "Grenadine Syrup"]
  }
]
```

## Integration with Frontend

### Add to `frontend/src/api.js`:

```javascript
// ... existing code ...

export const getDrinkRecommendations = async (drinkName, limit = 10) => {
  const response = await fetch(
    `${API_BASE_URL}/drinks/${encodeURIComponent(drinkName)}/recommendations?limit=${limit}`
  );
  if (!response.ok) throw new Error('Failed to get recommendations');
  return response.json();
};

export const getRecommendationsByIngredients = async (ingredientIds, minMatch = 50) => {
  const response = await fetch(`${API_BASE_URL}/recommendations/by-ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredient_ids: ingredientIds,
      min_match_percentage: minMatch
    })
  });
  if (!response.ok) throw new Error('Failed to get recommendations');
  return response.json();
};
```

### Use in `App.jsx`:

```jsx
// Add state for recommendations
const [recommendations, setRecommendations] = useState([]);

// Fetch recommendations when a drink is selected
useEffect(() => {
  if (selectedDrink) {
    getDrinkRecommendations(selectedDrink.name, 5)
      .then(setRecommendations)
      .catch(console.error);
  }
}, [selectedDrink]);

// Display recommendations in the details card
{recommendations.length > 0 && (
  <div className="recommendations-section">
    <h3>Similar Drinks</h3>
    <ul>
      {recommendations.map(rec => (
        <li key={rec.drink_id}>
          {rec.name} ({rec.similarity_score}% similar)
        </li>
      ))}
    </ul>
  </div>
)}
```

## Testing

### Test Similarity Recommendations:
```bash
# Get recommendations for Margarita
curl "http://localhost:3001/api/drinks/Margarita/recommendations?limit=5"
```

### Test Ingredient-Based Recommendations:
```bash
# First, get some ingredient IDs
curl "http://localhost:3001/api/ingredients" | grep -i "tequila\|lime\|triple"

# Then use those IDs (or use names directly)
curl -X POST http://localhost:3001/api/recommendations/by-ingredients \
  -H "Content-Type: application/json" \
  -d '{"ingredient_names": ["Tequila", "Fresh Lime Juice"], "min_match_percentage": 50}'
```

## Next Steps

1. **Add UI components** to display recommendations
2. **Track user interactions** (which recommendations get clicked)
3. **Add user ratings** to enable collaborative filtering
4. **Implement hybrid approach** combining multiple methods
5. **Add caching** for frequently requested recommendations

