const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS: Allow requests from frontend (local dev or deployed)

// Normalize URLs by removing trailing slashes
const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const allowedOrigins = [
  normalizeUrl(process.env.FRONTEND_URL),
  'http://localhost:3000',
  'http://localhost:5173', // Vite default port
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Normalize the incoming origin (remove trailing slash)
    const normalizedOrigin = normalizeUrl(origin);
    
    // In production, check against allowed origins (also normalized)
    if (allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
      console.log('✅ CORS allowed:', normalizedOrigin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', normalizedOrigin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes

// Get all drinks (simple list)
app.get('/api/drinks', async (req, res) => {
  try {
    console.log('📋 Fetching all drinks from database...');
    const result = await db.query(
      'SELECT drink_id, name, glass_type, build_method, garnish FROM drinks ORDER BY name'
    );
    console.log(`✅ Found ${result.rows.length} drinks`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching drinks:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch drinks',
      details: err.message,
      code: err.code
    });
  }
});

// IMPORTANT: These specific routes must come BEFORE /api/drinks/:name
// Otherwise Express will match "method", "glass", "search", or "filter" as a drink name

// Search drinks by name
app.get('/api/drinks/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const result = await db.query(
      `SELECT drink_id, name, glass_type, build_method, garnish 
       FROM drinks 
       WHERE name ILIKE $1 
       ORDER BY name
       LIMIT 20`,
      [query]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching drinks:', err);
    res.status(500).json({ error: 'Failed to search drinks' });
  }
});

// Filter drinks - supports method and glass via query parameters
app.get('/api/drinks/filter', async (req, res) => {
  try {
    const { method, glass } = req.query;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (method) {
      conditions.push(`build_method = $${paramIndex}`);
      params.push(decodeURIComponent(method));
      paramIndex++;
    }

    if (glass) {
      conditions.push(`glass_type = $${paramIndex}`);
      params.push(decodeURIComponent(glass));
      paramIndex++;
    }

    if (conditions.length === 0) {
      // No filters provided, return all drinks
      const result = await db.query(
        'SELECT drink_id, name, glass_type, build_method, garnish FROM drinks ORDER BY name'
      );
      return res.json(result.rows);
    }

    const whereClause = conditions.join(' AND ');
    const query = `SELECT drink_id, name, glass_type, build_method, garnish 
                   FROM drinks 
                   WHERE ${whereClause} 
                   ORDER BY name`;

    console.log(`Filtering by: method="${method || 'none'}", glass="${glass || 'none'}"`);
    const result = await db.query(query, params);
    console.log(`Found ${result.rows.length} drinks`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error filtering drinks:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to filter drinks', details: err.message });
  }
});

// Filter drinks by build method (backward compatibility)
app.get('/api/drinks/method/:method', async (req, res) => {
  try {
    const method = decodeURIComponent(req.params.method);
    console.log(`Filtering by method: "${method}"`);
    const result = await db.query(
      `SELECT drink_id, name, glass_type, build_method, garnish 
       FROM drinks 
       WHERE build_method = $1 
       ORDER BY name`,
      [method]
    );
    console.log(`Found ${result.rows.length} drinks with method "${method}"`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error filtering by method:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to filter drinks by method', details: err.message });
  }
});

// Filter drinks by glass type (backward compatibility)
app.get('/api/drinks/glass/:glass', async (req, res) => {
  try {
    const glass = decodeURIComponent(req.params.glass);
    console.log(`Filtering by glass: "${glass}"`);
    const result = await db.query(
      `SELECT drink_id, name, glass_type, build_method, garnish 
       FROM drinks 
       WHERE glass_type = $1 
       ORDER BY name`,
      [glass]
    );
    console.log(`Found ${result.rows.length} drinks with glass "${glass}"`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error filtering by glass:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to filter drinks by glass', details: err.message });
  }
});

// Get all available ingredients and unique garnishes
app.get('/api/ingredients', async (req, res) => {
  try {
    // Get all ingredients
    const ingredientsResult = await db.query(
      'SELECT ingredient_id, name FROM ingredients ORDER BY name'
    );
    
    // Get all unique garnishes (non-null, non-empty)
    const garnishesResult = await db.query(
      `SELECT DISTINCT garnish as name 
       FROM drinks 
       WHERE garnish IS NOT NULL AND garnish != '' 
       ORDER BY garnish`
    );
    
    // Combine ingredients and garnishes, removing duplicates
    const allItems = new Map();
    
    // Add ingredients
    ingredientsResult.rows.forEach(ing => {
      allItems.set(ing.name.toLowerCase(), {
        ingredient_id: ing.ingredient_id,
        name: ing.name,
        type: 'ingredient'
      });
    });
    
    // Add garnishes (only if not already in ingredients)
    garnishesResult.rows.forEach(garnish => {
      const key = garnish.name.toLowerCase();
      if (!allItems.has(key)) {
        allItems.set(key, {
          ingredient_id: null,
          name: garnish.name,
          type: 'garnish'
        });
      }
    });
    
    // Convert to array and sort
    const result = Array.from(allItems.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    res.status(500).json({ error: 'Failed to fetch ingredients', details: err.message });
  }
});

// Search drinks by ingredients (AND logic - drinks must contain all specified ingredients)
// Also searches garnishes - if an ingredient matches a garnish, it will find drinks with that garnish
// This must come BEFORE /api/drinks/:name to avoid matching "by-ingredients" as a drink name
app.get('/api/drinks/by-ingredients', async (req, res) => {
  try {
    const ingredients = req.query.ingredients;
    
    if (!ingredients) {
      return res.status(400).json({ error: 'Ingredients parameter is required' });
    }
    
    // Handle both single ingredient and comma-separated list
    const ingredientList = Array.isArray(ingredients) 
      ? ingredients 
      : ingredients.split(',').map(i => i.trim()).filter(Boolean);
    
    if (ingredientList.length === 0) {
      return res.status(400).json({ error: 'At least one ingredient is required' });
    }
    
    // Build query to find drinks that contain ALL specified ingredients
    // Search both in ingredients table AND in garnish field
    const params = [];
    const ingredientConditions = [];
    
    ingredientList.forEach((ingredient, index) => {
      params.push(`%${ingredient}%`);
      // Search in both ingredients and garnishes
      ingredientConditions.push(`(
        EXISTS (
          SELECT 1 
          FROM drink_ingredients di
          JOIN ingredients i ON di.ingredient_id = i.ingredient_id
          WHERE di.drink_id = d.drink_id
          AND LOWER(i.name) LIKE LOWER($${index + 1})
        )
        OR LOWER(d.garnish) LIKE LOWER($${index + 1})
      )`);
    });
    
    const query = `
      SELECT DISTINCT d.drink_id, d.name, d.glass_type, d.build_method, d.garnish
      FROM drinks d
      WHERE ${ingredientConditions.join(' AND ')}
      ORDER BY d.name
    `;
    
    console.log(`Searching drinks by ingredients/garnishes: ${ingredientList.join(', ')}`);
    const result = await db.query(query, params);
    console.log(`Found ${result.rows.length} drinks`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching drinks by ingredients:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to search drinks by ingredients', details: err.message });
  }
});

// Get drink by name with full details including ingredients
// This must come LAST to avoid matching "method", "glass", "search", "filter", or "by-ingredients" as drink names
app.get('/api/drinks/:name', async (req, res) => {
  try {
    const drinkName = decodeURIComponent(req.params.name);
    console.log(`Fetching drink details for: "${drinkName}"`);
    
    // Get drink details (case-insensitive match)
    const drinkResult = await db.query(
      'SELECT drink_id, name, description, glass_type, build_method, garnish FROM drinks WHERE LOWER(name) = LOWER($1)',
      [drinkName]
    );
    
    if (drinkResult.rows.length === 0) {
      console.log(`Drink not found: "${drinkName}"`);
      return res.status(404).json({ error: 'Drink not found', name: drinkName });
    }
    
    const drink = drinkResult.rows[0];
    
    // Get ingredients for this drink
    const ingredientsResult = await db.query(
      `SELECT i.name, di.amount, di.unit
       FROM drink_ingredients di
       JOIN ingredients i ON di.ingredient_id = i.ingredient_id
       WHERE di.drink_id = $1
       ORDER BY i.name`,
      [drink.drink_id]
    );
    
    drink.ingredients = ingredientsResult.rows;
    
    res.json(drink);
  } catch (err) {
    console.error('Error fetching drink:', err);
    res.status(500).json({ error: 'Failed to fetch drink' });
  }
});

// Get Game Night Menu
app.get('/api/game-night-menu', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         m.menu_id, 
         m.drink_name, 
         m.description, 
         m.price, 
         m.display_order,
         d.drink_id
       FROM game_night_menu m
       LEFT JOIN drinks d ON LOWER(m.drink_name) = LOWER(d.name)
       ORDER BY m.display_order ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching game night menu:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch game night menu', details: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler for debugging
app.use('/api/*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origins:`, allowedOrigins.length > 0 ? allowedOrigins : 'All (development mode)');
  console.log(`Frontend URL (raw): ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`Frontend URL (normalized): ${normalizeUrl(process.env.FRONTEND_URL) || 'Not set'}`);
});

