# Recommendation Engine Guide for DrinksDB

## Overview

This guide covers multiple approaches to building a recommendation engine for your cocktail database, from simple content-based filtering to advanced machine learning models.

## Database Schema Summary

Your database has:
- **drinks**: drink_id, name, description, glass_type, build_method, garnish
- **ingredients**: ingredient_id, name, category, subcategory, abv
- **drink_ingredients**: drink_id, ingredient_id, amount, unit
- **drink_flavor_profiles**: drink_id, sweetness, sourness, bitterness, etc. (0-10 scale)

---

## Approach 1: Content-Based Filtering (Simplest - Start Here)

### Concept
Recommend drinks similar to a given drink based on shared characteristics (ingredients, flavor profiles, glass type, build method).

### Implementation Steps

#### Step 1: Create Similarity Function

```sql
-- Create a function to calculate ingredient similarity
CREATE OR REPLACE FUNCTION calculate_ingredient_similarity(
    drink1_id INT,
    drink2_id INT
) RETURNS NUMERIC AS $$
DECLARE
    common_ingredients INT;
    total_ingredients INT;
    similarity NUMERIC;
BEGIN
    -- Count common ingredients
    SELECT COUNT(*) INTO common_ingredients
    FROM (
        SELECT ingredient_id FROM drink_ingredients WHERE drink_id = drink1_id
        INTERSECT
        SELECT ingredient_id FROM drink_ingredients WHERE drink_id = drink2_id
    ) common;
    
    -- Count total unique ingredients in both drinks
    SELECT COUNT(*) INTO total_ingredients
    FROM (
        SELECT ingredient_id FROM drink_ingredients WHERE drink_id = drink1_id
        UNION
        SELECT ingredient_id FROM drink_ingredients WHERE drink_id = drink2_id
    ) total;
    
    -- Jaccard similarity: common / total
    IF total_ingredients = 0 THEN
        RETURN 0;
    END IF;
    
    similarity := (common_ingredients::NUMERIC / total_ingredients::NUMERIC) * 100;
    RETURN similarity;
END;
$$ LANGUAGE plpgsql;
```

#### Step 2: Add Backend Endpoint

Add to `backend/server.js`:

```javascript
// Get recommendations based on a drink
app.get('/api/drinks/:name/recommendations', async (req, res) => {
  try {
    const drinkName = decodeURIComponent(req.params.name);
    const limit = parseInt(req.query.limit) || 10;
    
    // Get the drink_id
    const drinkResult = await db.query(
      'SELECT drink_id FROM drinks WHERE LOWER(name) = LOWER($1)',
      [drinkName]
    );
    
    if (drinkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    
    const drinkId = drinkResult.rows[0].drink_id;
    
    // Find similar drinks using ingredient similarity
    const recommendations = await db.query(
      `SELECT 
        d.drink_id,
        d.name,
        d.glass_type,
        d.build_method,
        d.garnish,
        calculate_ingredient_similarity($1, d.drink_id) as similarity_score
      FROM drinks d
      WHERE d.drink_id != $1
      ORDER BY similarity_score DESC
      LIMIT $2`,
      [drinkId, limit]
    );
    
    res.json(recommendations.rows);
  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});
```

#### Step 3: Enhanced Similarity (Multiple Factors)

For better recommendations, combine multiple factors:

```sql
CREATE OR REPLACE FUNCTION calculate_drink_similarity(
    drink1_id INT,
    drink2_id INT
) RETURNS NUMERIC AS $$
DECLARE
    ingredient_score NUMERIC;
    glass_score NUMERIC;
    method_score NUMERIC;
    flavor_score NUMERIC;
    total_score NUMERIC;
BEGIN
    -- Ingredient similarity (0-100)
    SELECT calculate_ingredient_similarity(drink1_id, drink2_id) INTO ingredient_score;
    
    -- Glass type match (0 or 100)
    SELECT CASE 
        WHEN d1.glass_type = d2.glass_type THEN 100
        ELSE 0
    END INTO glass_score
    FROM drinks d1, drinks d2
    WHERE d1.drink_id = drink1_id AND d2.drink_id = drink2_id;
    
    -- Build method match (0 or 50)
    SELECT CASE 
        WHEN d1.build_method = d2.build_method THEN 50
        ELSE 0
    END INTO method_score
    FROM drinks d1, drinks d2
    WHERE d1.drink_id = drink1_id AND d2.drink_id = drink2_id;
    
    -- Flavor profile similarity (if available)
    SELECT COALESCE(
        SQRT(
            POWER(COALESCE(f1.sweetness - f2.sweetness, 0), 2) +
            POWER(COALESCE(f1.sourness - f2.sourness, 0), 2) +
            POWER(COALESCE(f1.bitterness - f2.bitterness, 0), 2) +
            POWER(COALESCE(f1.herbal - f2.herbal, 0), 2) +
            POWER(COALESCE(f1.fruity - f2.fruity, 0), 2)
        ) / 5, -- Normalize by number of factors
        50 -- Default if no flavor profile
    ) INTO flavor_score
    FROM drink_flavor_profiles f1
    FULL OUTER JOIN drink_flavor_profiles f2 ON f1.drink_id = drink1_id AND f2.drink_id = drink2_id;
    
    -- Weighted combination
    total_score := (ingredient_score * 0.5) + 
                   (glass_score * 0.1) + 
                   (method_score * 0.1) + 
                   ((100 - flavor_score) * 0.3); -- Lower distance = higher score
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;
```

---

## Approach 2: User-Based Collaborative Filtering

### Concept
If users rate drinks, recommend drinks liked by users with similar tastes.

### Prerequisites
You'll need to add a user ratings table:

```sql
CREATE TABLE user_ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- or use session_id for anonymous users
    drink_id INT REFERENCES drinks(drink_id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, drink_id)
);

CREATE INDEX idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX idx_user_ratings_drink ON user_ratings(drink_id);
```

### Implementation

```sql
-- Find users with similar taste
CREATE OR REPLACE FUNCTION find_similar_users(
    target_user_id INT,
    min_common_drinks INT DEFAULT 3
) RETURNS TABLE(user_id INT, similarity NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH target_ratings AS (
        SELECT drink_id, rating FROM user_ratings WHERE user_id = target_user_id
    ),
    user_similarities AS (
        SELECT 
            ur.user_id,
            COUNT(*) as common_drinks,
            AVG(ABS(ur.rating - tr.rating)) as avg_rating_diff,
            -- Cosine similarity or Pearson correlation could be used here
            (1.0 - AVG(ABS(ur.rating - tr.rating)) / 4.0) * 100 as similarity
        FROM user_ratings ur
        JOIN target_ratings tr ON ur.drink_id = tr.drink_id
        WHERE ur.user_id != target_user_id
        GROUP BY ur.user_id
        HAVING COUNT(*) >= min_common_drinks
    )
    SELECT user_id, similarity
    FROM user_similarities
    ORDER BY similarity DESC;
END;
$$ LANGUAGE plpgsql;

-- Get recommendations from similar users
CREATE OR REPLACE FUNCTION get_collaborative_recommendations(
    target_user_id INT,
    limit_count INT DEFAULT 10
) RETURNS TABLE(drink_id INT, name TEXT, predicted_rating NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH similar_users AS (
        SELECT user_id, similarity FROM find_similar_users(target_user_id)
        LIMIT 50 -- Top 50 similar users
    ),
    recommended_drinks AS (
        SELECT 
            ur.drink_id,
            AVG(ur.rating * su.similarity / 100.0) as predicted_rating,
            COUNT(*) as recommendation_count
        FROM user_ratings ur
        JOIN similar_users su ON ur.user_id = su.user_id
        WHERE ur.drink_id NOT IN (
            SELECT drink_id FROM user_ratings WHERE user_id = target_user_id
        )
        GROUP BY ur.drink_id
        HAVING COUNT(*) >= 2 -- At least 2 similar users rated it
    )
    SELECT 
        rd.drink_id,
        d.name,
        rd.predicted_rating
    FROM recommended_drinks rd
    JOIN drinks d ON rd.drink_id = d.drink_id
    ORDER BY rd.predicted_rating DESC, rd.recommendation_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

---

## Approach 3: Hybrid Approach (Best Results)

Combine content-based and collaborative filtering:

```sql
CREATE OR REPLACE FUNCTION get_hybrid_recommendations(
    target_drink_id INT,
    target_user_id INT DEFAULT NULL,
    limit_count INT DEFAULT 10
) RETURNS TABLE(
    drink_id INT,
    name TEXT,
    content_score NUMERIC,
    collaborative_score NUMERIC,
    final_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH content_recommendations AS (
        SELECT 
            d.drink_id,
            d.name,
            calculate_drink_similarity(target_drink_id, d.drink_id) as content_score
        FROM drinks d
        WHERE d.drink_id != target_drink_id
    ),
    collaborative_recommendations AS (
        SELECT 
            drink_id,
            name,
            predicted_rating * 20 as collaborative_score -- Scale 1-5 to 0-100
        FROM get_collaborative_recommendations(target_user_id, 100)
        WHERE target_user_id IS NOT NULL
    )
    SELECT 
        COALESCE(cr.drink_id, colr.drink_id) as drink_id,
        COALESCE(cr.name, colr.name) as name,
        COALESCE(cr.content_score, 0) as content_score,
        COALESCE(colr.collaborative_score, 0) as collaborative_score,
        (COALESCE(cr.content_score, 0) * 0.6 + COALESCE(colr.collaborative_score, 0) * 0.4) as final_score
    FROM content_recommendations cr
    FULL OUTER JOIN collaborative_recommendations colr ON cr.drink_id = colr.drink_id
    ORDER BY final_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

---

## Approach 4: Machine Learning (Advanced)

### Using Python with scikit-learn

Create `backend/ml_recommender.py`:

```python
import psycopg2
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import pickle
import os

class DrinkRecommender:
    def __init__(self, db_config):
        self.db_config = db_config
        self.vectorizer = None
        self.drink_vectors = None
        self.drink_ids = None
        
    def load_data(self):
        """Load drinks and their ingredients from database"""
        conn = psycopg2.connect(**self.db_config)
        cursor = conn.cursor()
        
        # Get all drinks with their ingredients as text
        query = """
            SELECT 
                d.drink_id,
                d.name,
                STRING_AGG(i.name, ' ') as ingredients_text,
                d.glass_type,
                d.build_method
            FROM drinks d
            LEFT JOIN drink_ingredients di ON d.drink_id = di.drink_id
            LEFT JOIN ingredients i ON di.ingredient_id = i.ingredient_id
            GROUP BY d.drink_id, d.name, d.glass_type, d.build_method
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        self.drink_ids = [row[0] for row in rows]
        drink_texts = [
            f"{row[1]} {row[2] or ''} {row[3] or ''} {row[4] or ''}"
            for row in rows
        ]
        
        # Create TF-IDF vectors
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.drink_vectors = self.vectorizer.fit_transform(drink_texts)
        
        cursor.close()
        conn.close()
        
    def recommend(self, drink_id, n=10):
        """Get recommendations for a drink"""
        if drink_id not in self.drink_ids:
            return []
            
        drink_index = self.drink_ids.index(drink_id)
        drink_vector = self.drink_vectors[drink_index]
        
        # Calculate cosine similarity with all drinks
        similarities = cosine_similarity(drink_vector, self.drink_vectors)[0]
        
        # Get top N similar drinks (excluding the drink itself)
        similar_indices = np.argsort(similarities)[::-1][1:n+1]
        
        recommendations = []
        for idx in similar_indices:
            recommendations.append({
                'drink_id': self.drink_ids[idx],
                'similarity': float(similarities[idx])
            })
            
        return recommendations
    
    def save_model(self, filepath='recommender_model.pkl'):
        """Save the trained model"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'vectorizer': self.vectorizer,
                'drink_vectors': self.drink_vectors,
                'drink_ids': self.drink_ids
            }, f)
    
    def load_model(self, filepath='recommender_model.pkl'):
        """Load a saved model"""
        with open(filepath, 'rb') as f:
            model = pickle.load(f)
            self.vectorizer = model['vectorizer']
            self.drink_vectors = model['drink_vectors']
            self.drink_ids = model['drink_ids']

# Usage
if __name__ == '__main__':
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'drinksdb_81xl'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '')
    }
    
    recommender = DrinkRecommender(db_config)
    recommender.load_data()
    recommender.save_model()
    
    # Test recommendation
    recommendations = recommender.recommend(1, n=5)
    print(recommendations)
```

### Integrate with Express.js

Add to `backend/server.js`:

```javascript
const { spawn } = require('child_process');

// Train and get ML recommendations
app.get('/api/drinks/:name/ml-recommendations', async (req, res) => {
  try {
    const drinkName = decodeURIComponent(req.params.name);
    const limit = parseInt(req.query.limit) || 10;
    
    // Get drink_id
    const drinkResult = await db.query(
      'SELECT drink_id FROM drinks WHERE LOWER(name) = LOWER($1)',
      [drinkName]
    );
    
    if (drinkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    
    const drinkId = drinkResult.rows[0].drink_id;
    
    // Call Python ML script
    const python = spawn('python', ['ml_recommender.py', drinkId, limit]);
    let output = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        const recommendations = JSON.parse(output);
        res.json(recommendations);
      } else {
        res.status(500).json({ error: 'ML recommendation failed' });
      }
    });
  } catch (err) {
    console.error('Error getting ML recommendations:', err);
    res.status(500).json({ error: 'Failed to get ML recommendations' });
  }
});
```

---

## Approach 5: Real-Time Recommendations Based on Available Ingredients

### Concept
Recommend drinks based on what ingredients a user has available.

```sql
CREATE OR REPLACE FUNCTION recommend_by_available_ingredients(
    available_ingredient_ids INT[],
    min_match_percentage NUMERIC DEFAULT 50
) RETURNS TABLE(
    drink_id INT,
    name TEXT,
    matched_ingredients INT,
    total_ingredients INT,
    match_percentage NUMERIC,
    missing_ingredients TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH drink_stats AS (
        SELECT 
            d.drink_id,
            d.name,
            COUNT(DISTINCT di.ingredient_id) as total_ingredients,
            COUNT(DISTINCT CASE 
                WHEN di.ingredient_id = ANY(available_ingredient_ids) 
                THEN di.ingredient_id 
            END) as matched_ingredients
        FROM drinks d
        JOIN drink_ingredients di ON d.drink_id = di.drink_id
        GROUP BY d.drink_id, d.name
    ),
    missing_ingredients_list AS (
        SELECT 
            ds.drink_id,
            ARRAY_AGG(i.name) as missing
        FROM drink_stats ds
        JOIN drink_ingredients di ON ds.drink_id = di.drink_id
        JOIN ingredients i ON di.ingredient_id = i.ingredient_id
        WHERE di.ingredient_id != ALL(available_ingredient_ids)
        GROUP BY ds.drink_id
    )
    SELECT 
        ds.drink_id,
        ds.name,
        ds.matched_ingredients::INT,
        ds.total_ingredients::INT,
        (ds.matched_ingredients::NUMERIC / NULLIF(ds.total_ingredients, 0) * 100) as match_percentage,
        COALESCE(mil.missing, ARRAY[]::TEXT[]) as missing_ingredients
    FROM drink_stats ds
    LEFT JOIN missing_ingredients_list mil ON ds.drink_id = mil.drink_id
    WHERE (ds.matched_ingredients::NUMERIC / NULLIF(ds.total_ingredients, 0) * 100) >= min_match_percentage
    ORDER BY match_percentage DESC, ds.total_ingredients ASC; -- Prefer drinks with fewer missing ingredients
END;
$$ LANGUAGE plpgsql;
```

### Backend Endpoint

```javascript
// Recommend drinks based on available ingredients
app.post('/api/recommendations/by-ingredients', async (req, res) => {
  try {
    const { ingredient_ids, min_match_percentage } = req.body;
    
    if (!ingredient_ids || !Array.isArray(ingredient_ids)) {
      return res.status(400).json({ error: 'ingredient_ids array is required' });
    }
    
    const minMatch = min_match_percentage || 50;
    
    const result = await db.query(
      'SELECT * FROM recommend_by_available_ingredients($1::INT[], $2)',
      [ingredient_ids, minMatch]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting ingredient-based recommendations:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});
```

---

## Implementation Priority

1. **Start with Approach 1** (Content-Based) - Easiest, works immediately
2. **Add Approach 5** (Available Ingredients) - Very practical for users
3. **Add Approach 2** (Collaborative) - If you add user ratings
4. **Combine into Approach 3** (Hybrid) - Best results
5. **Consider Approach 4** (ML) - If you need more sophisticated recommendations

---

## Testing Your Recommendations

```sql
-- Test ingredient similarity
SELECT 
    d1.name as drink1,
    d2.name as drink2,
    calculate_ingredient_similarity(d1.drink_id, d2.drink_id) as similarity
FROM drinks d1
CROSS JOIN drinks d2
WHERE d1.drink_id < d2.drink_id
ORDER BY similarity DESC
LIMIT 10;

-- Test recommendations for a specific drink
SELECT * FROM get_hybrid_recommendations(
    (SELECT drink_id FROM drinks WHERE name = 'Margarita'),
    NULL,
    10
);
```

---

## Next Steps

1. **Add flavor profile data** - Populate `drink_flavor_profiles` for better recommendations
2. **Add user tracking** - Track which drinks users view/click (even without ratings)
3. **A/B testing** - Test different recommendation algorithms
4. **Analytics** - Track which recommendations get clicked
5. **Cold start problem** - For new drinks, use content-based only

---

## External Data Sources for Enhancement

- **CocktailDB API** - Additional drink data and ratings
- **AllRecipes/Drink Recipes** - Scrape popular recipes for popularity signals
- **Reddit/Instagram** - Social media mentions for trending drinks
- **ABV data** - Enhance ingredient ABV for strength-based recommendations
- **Flavor pairing data** - Scientific flavor pairing databases

