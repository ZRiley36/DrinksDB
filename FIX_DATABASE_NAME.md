# Fix Database Name Mismatch

## The Issue

Your Render database logs show:
```
database=drinksdb_81xl
```

But your backend might be trying to connect to `drinksDB` (different name).

## The Fix

### Step 1: Check Your Database Name

From your Render database connection string, the database name is:
```
drinksdb_81xl
```

This is the part after the final `/` in the Internal Database URL.

### Step 2: Update Render Backend Environment Variable

1. **Go to Render dashboard → Your backend service → Environment**

2. **Find `DB_NAME`**

3. **Update it to match your actual database name:**
   ```
   DB_NAME=drinksdb_81xl
   ```
   ⚠️ **Important**: Must match exactly (case-sensitive, no spaces)

4. **Save** - This will trigger a redeploy

### Step 3: Verify All Database Variables

While you're there, make sure all these match your Internal Database URL:

```
DB_USER=postgres
DB_HOST=dpg-d4b4d47gi27c7394kvog-a
DB_NAME=drinksdb_81xl
DB_PASSWORD=<your-password-from-connection-string>
DB_PORT=5432
```

### Step 4: Check if Tables Exist

The connection is working, but the tables might not exist yet.

1. **Connect to your Render database** (see `DATABASE_CONNECTION.md`)
2. **Run this query:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. **If no tables exist**, run the migration files:
   - `database/commands.sql`
   - `database/seed_data_new.sql`
   - `database/game_night_menu.sql`

## How to Get the Correct Database Name

1. **Render dashboard → Your PostgreSQL database**
2. **Click "Connect" tab**
3. **Copy the "Internal Database URL"**
4. **The database name is after the final `/`**

Example:
```
postgresql://postgres:password@host:5432/drinksdb_81xl
                                                      ^^^^^^^^^^^^^^
                                                      This is DB_NAME
```

## After Updating

1. **Render will automatically redeploy** (takes 3-6 minutes)
2. **Check the logs** - should see "Database connected successfully"
3. **Test the API** - should work now!

## Quick Checklist

- [ ] Found actual database name from Internal Database URL
- [ ] Updated `DB_NAME` in Render backend environment variables
- [ ] Verified all other DB variables are correct
- [ ] Checked if tables exist in database
- [ ] Ran migration files if tables don't exist
- [ ] Waited for redeploy to complete
- [ ] Tested the API endpoint

