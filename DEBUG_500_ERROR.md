# Debugging 500 Error from Backend

## The Error
```
Status: 500
Error: "Failed to fetch drinks"
```

## What This Means
- ✅ CORS is working (request reached backend)
- ✅ Backend is running
- ❌ Backend is failing when trying to query the database

## Most Likely Causes

### 1. Database Not Connected
**Check Render backend logs:**
- Go to Render → Your backend service → "Logs" tab
- Look for: `Database connected successfully`
- If you see database connection errors, the DB env vars are wrong

### 2. Database Not Set Up
**Problem**: The database exists but tables don't exist yet.

**Fix:**
1. Connect to your Render database (see `DATABASE_CONNECTION.md`)
2. Run these SQL files in order:
   - `database/commands.sql` (creates tables)
   - `database/seed_data_new.sql` (populates drinks)
   - `database/game_night_menu.sql` (adds menu)

### 3. Wrong Database Environment Variables
**Check in Render:**
- Go to your backend service → Environment
- Verify these are set correctly (from Internal Database URL):
  - `DB_USER`
  - `DB_HOST`
  - `DB_NAME`
  - `DB_PASSWORD`
  - `DB_PORT` (should be `5432`)

### 4. Database Name Mismatch
**Problem**: `DB_NAME` might be wrong.

**Check:**
- Render database → Connect tab → Internal Database URL
- The database name is after the final `/`
- Make sure `DB_NAME` in backend matches exactly

## How to Debug

### Step 1: Check Render Backend Logs

1. **Go to Render dashboard**
2. **Click your backend service**
3. **Click "Logs" tab**
4. **Look for:**
   - `Database connected successfully` ✅
   - `Error fetching drinks:` ❌
   - Database connection errors ❌

### Step 2: Check the Actual Error

The updated code now logs more details. In Render logs, you should see:
```
❌ Error fetching drinks: [error details]
Error details: {
  message: "...",
  code: "...",
  stack: "..."
}
```

This will tell you exactly what's wrong.

### Step 3: Test Database Connection

1. **Connect to your Render database** (see `DATABASE_CONNECTION.md`)
2. **Run this query:**
   ```sql
   SELECT COUNT(*) FROM drinks;
   ```
3. **If it errors**, the tables don't exist - run the SQL migration files
4. **If it returns 0**, the tables exist but are empty - run the seed data

## Common Error Messages

### "relation 'drinks' does not exist"
**Fix**: Run `database/commands.sql` to create tables

### "password authentication failed"
**Fix**: Check `DB_PASSWORD` in Render environment variables

### "could not connect to server"
**Fix**: Check `DB_HOST` - should be from Internal Database URL (no `.render.com`)

### "database 'drinksDB' does not exist"
**Fix**: Check `DB_NAME` - should match the database name from connection string

## Quick Fix Checklist

- [ ] Check Render backend logs for actual error message
- [ ] Verify database connection message appears in logs
- [ ] Check all DB environment variables are set in Render
- [ ] Verify database tables exist (connect and check)
- [ ] Run SQL migration files if tables don't exist
- [ ] Check `DB_NAME` matches the actual database name

## Next Steps

1. **Check Render logs** - This will show the exact error
2. **Share the error message** from the logs
3. **I can help fix it** based on the specific error

The updated code now provides more detailed error messages, so the Render logs should show exactly what's wrong!

