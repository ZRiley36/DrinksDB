/**
 * One-off script to run the Drinks with Risha menu migration.
 * Uses backend/.env for DATABASE_URL or DB_* (same as server).
 * Run from project root: node backend/run-risha-migration.js
 */
const path = require('path');
const fs = require('fs');

// Load DrinksDB.env from project root
require('dotenv').config({ path: path.join(__dirname, '..', 'DrinksDB.env') });

const db = require('./db');

const sqlPath = path.join(__dirname, '..', 'database', 'drinks_with_risha_menu.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function run() {
  try {
    console.log('Running drinks_with_risha_menu migration...');
    await db.query(sql);
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();
