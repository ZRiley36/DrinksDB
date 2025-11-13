# Debugging Database Environment Variable

## The Issue

The error shows the backend is trying to connect to `DrinksDB`, but:
- You say it's correct in Render
- The actual database is `drinksdb_81xl`

## Possible Causes

### 1. Environment Variable Not Being Read

The backend code has a default fallback:
```javascript
database: process.env.DB_NAME || 'drinksDB'
```

If `DB_NAME` isn't set or isn't being read, it uses `drinksDB` (wrong).

### 2. Environment Variable Not Set

Check in Render:
- Go to your backend service → Environment
- Make sure `DB_NAME` exists and is set to `drinksdb_81xl`
- No typos, no extra spaces

### 3. Case Sensitivity

PostgreSQL database names are case-sensitive when quoted. Make sure:
- `DB_NAME=drinksdb_81xl` (all lowercase, exact match)

## How to Debug

### Step 1: Check Render Environment Variables

1. **Render dashboard → Your backend service**
2. **Environment tab**
3. **Verify `DB_NAME` is set to:** `drinksdb_81xl`
4. **Check for typos or extra spaces**

### Step 2: Check Backend Logs

After the code update, the backend will log the database configuration on startup. Check Render logs for:

```
🔧 Database Configuration: {
  DB_NAME: "drinksdb_81xl" or "drinksdb_81xl (default)"
  ...
}
```

- If it says `(default)`, the environment variable isn't being read
- If it shows the wrong value, the environment variable is set incorrectly

### Step 3: Verify Environment Variable is Set

In Render:
1. **Environment tab**
2. **Look for `DB_NAME`**
3. **Value should be exactly:** `drinksdb_81xl`
4. **No quotes, no spaces, all lowercase**

### Step 4: Force a Redeploy

Sometimes environment variables don't take effect until redeploy:
1. **Make sure `DB_NAME` is set correctly**
2. **Click "Save Changes"**
3. **Or trigger a manual redeploy**

## The Fix

I've updated the backend code to:
1. **Log the database configuration** on startup
2. **Change the default** from `drinksDB` to `drinksdb_81xl`
3. **Show better error messages** if connection fails

## Next Steps

1. **Push the updated code:**
   ```bash
   git add backend/db.js
   git commit -m "Add database config logging and fix default DB name"
   git push
   ```

2. **Check Render logs** after redeploy
   - Look for the "🔧 Database Configuration" log
   - See what value it's using

3. **If it still shows the wrong value:**
   - Double-check `DB_NAME` in Render environment variables
   - Make sure there are no typos
   - Try deleting and re-adding the variable

## Quick Checklist

- [ ] `DB_NAME` is set in Render environment variables
- [ ] Value is exactly `drinksdb_81xl` (no quotes, no spaces)
- [ ] Pushed updated backend code with logging
- [ ] Checked Render logs for database configuration
- [ ] Verified the value being used matches `drinksdb_81xl`

