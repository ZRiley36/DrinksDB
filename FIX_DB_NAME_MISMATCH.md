# Fix: Database "DrinksDB" Does Not Exist

## The Error
```
FATAL: database "DrinksDB" does not exist
```

## The Problem
Your backend is trying to connect to `DrinksDB` (with capital D and B), but your actual database is named `drinksdb_81xl` (all lowercase with numbers).

## The Fix

### Step 1: Update DB_NAME in Render

1. **Go to Render dashboard**
2. **Click your backend service**
3. **Go to "Environment" tab**
4. **Find `DB_NAME`**
5. **Change it from `DrinksDB` to `drinksdb_81xl`**
   - Must be exact: `drinksdb_81xl`
   - Case-sensitive!
   - No spaces!
6. **Click "Save Changes"**
7. **Render will automatically redeploy** (takes 3-6 minutes)

### Step 2: Verify All Database Variables

While you're there, make sure all these are correct (from your Internal Database URL):

```
DB_USER=drinksdb_81xl_user
DB_HOST=dpg-d4b4d47gi27c7394kvog-a
DB_NAME=drinksdb_81xl  ← This is the one that needs fixing!
DB_PASSWORD=<your-password-from-connection-string>
DB_PORT=5432
```

### Step 3: Wait for Redeploy

After saving, Render will redeploy. Check the logs to see:
- `Database connected successfully` ✅
- No more "database does not exist" errors ✅

## How to Get the Correct Database Name

1. **Render dashboard → Your PostgreSQL database**
2. **Click "Connect" tab**
3. **Copy "Internal Database URL"**
4. **The database name is after the final `/`**

Example:
```
postgresql://drinksdb_81xl_user:password@dpg-d4b4d47gi27c7394kvog-a:5432/drinksdb_81xl
                                                                      ^^^^^^^^^^^^^^
                                                                      This is DB_NAME
```

## After Fixing

Once `DB_NAME` is set to `drinksdb_81xl`:
1. ✅ Backend will connect to the correct database
2. ✅ You'll see "Database connected successfully" in logs
3. ✅ API calls should work

**Note**: You still need to make sure the tables exist in the database. If you haven't run the SQL migration files yet, you'll need to do that too (see `DATABASE_CONNECTION.md`).

## Quick Checklist

- [ ] Updated `DB_NAME` from `DrinksDB` to `drinksdb_81xl` in Render
- [ ] Verified all other DB environment variables are correct
- [ ] Saved changes (triggered redeploy)
- [ ] Waited for redeploy to complete (3-6 minutes)
- [ ] Checked logs for "Database connected successfully"
- [ ] Verified tables exist in database (if not, run migration files)

