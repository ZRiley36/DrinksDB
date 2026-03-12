/**
 * Update only the Drinks with Risha menu descriptions (taste blurbs).
 * Safe to run multiple times. Uses DrinksDB.env or Render env.
 * Run from project root: node backend/run-risha-descriptions-update.js
 */
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', 'DrinksDB.env') });
const db = require('./db');

const sqlPath = path.join(__dirname, '..', 'database', 'drinks_with_risha_menu.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function run() {
  try {
    console.log('Updating Drinks with Risha menu descriptions...');
    await db.query(sql);
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err.message);
    process.exit(1);
  }
}

run();
