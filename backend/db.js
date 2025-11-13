const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'drinksdb_81xl', // Default to actual Render DB name
  password: process.env.DB_PASSWORD || 'poopbutt',
  port: process.env.DB_PORT || 5432,
});

// Debug logging
console.log('🔧 Database Configuration:', {
  DB_USER: process.env.DB_USER || 'postgres (default)',
  DB_HOST: process.env.DB_HOST || 'localhost (default)',
  DB_NAME: process.env.DB_NAME || 'drinksdb_81xl (default)',
  DB_PORT: process.env.DB_PORT || '5432 (default)',
  DB_PASSWORD: process.env.DB_PASSWORD ? '***set***' : 'poopbutt (default)'
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      database: process.env.DB_NAME || 'drinksdb_81xl (default)'
    });
  } else {
    console.log('✅ Database connected successfully');
    console.log('Connected to database:', process.env.DB_NAME || 'drinksdb_81xl (default)');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

