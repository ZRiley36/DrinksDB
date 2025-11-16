const { Pool } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL (connection string) and individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string if provided (common for cloud databases like Render)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false
  };
} else {
  // Use individual parameters
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'drinksdb_81xl',
    password: process.env.DB_PASSWORD || 'poopbutt',
    port: process.env.DB_PORT || 5432,
  };
}

const pool = new Pool(poolConfig);

// Debug logging
console.log('🔧 Database Configuration:', {
  usingConnectionString: !!process.env.DATABASE_URL,
  DB_USER: process.env.DB_USER || (process.env.DATABASE_URL ? 'from DATABASE_URL' : 'postgres (default)'),
  DB_HOST: process.env.DB_HOST || (process.env.DATABASE_URL ? 'from DATABASE_URL' : 'localhost (default)'),
  DB_NAME: process.env.DB_NAME || (process.env.DATABASE_URL ? 'from DATABASE_URL' : 'drinksdb_81xl (default)'),
  DB_PORT: process.env.DB_PORT || (process.env.DATABASE_URL ? 'from DATABASE_URL' : '5432 (default)'),
  DB_PASSWORD: (process.env.DB_PASSWORD || process.env.DATABASE_URL) ? '***set***' : 'poopbutt (default)'
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

