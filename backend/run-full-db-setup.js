/**
 * One-off: run full DB schema + seed + menus on a fresh Render Postgres.
 * Uses DrinksDB.env (set DATABASE_URL to the External Database URL for local runs).
 * Run from project root: node backend/run-full-db-setup.js
 */
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', 'DrinksDB.env') });
const db = require('./db');

const sqlDir = path.join(__dirname, '..', 'database');
const files = [
  'commands.sql',           // schema (tables)
  'seed_data_new.sql',     // drinks + ingredients data
  'game_night_menu.sql',   // game night menu table + data
  'drinks_with_risha_menu.sql'
];

function runSql(sql, label) {
  return db.query(sql).then(() => {
    console.log('  OK:', label);
  }).catch(err => {
    console.error('  FAIL:', label, err.message);
    throw err;
  });
}

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set in DrinksDB.env. Use the External Database URL.');
    process.exit(1);
  }
  console.log('Running full DB setup...');
  try {
    for (const file of files) {
      const filePath = path.join(sqlDir, file);
      if (!fs.existsSync(filePath)) {
        console.log('  SKIP (file not found):', file);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      await runSql(sql, file);
    }
    console.log('Full DB setup completed.');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
}

run();
