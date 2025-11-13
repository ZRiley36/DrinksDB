# Connecting to Render Database in pgAdmin - Step by Step

## The Error You're Seeing
`[Errno 11001] getaddrinfo failed` means pgAdmin can't find the hostname. This usually means:
- The hostname is incorrect
- The connection string wasn't parsed correctly
- The database isn't created yet on Render

## Step 1: Get Your Connection Details from Render

1. Go to [render.com](https://render.com) and log in
2. Click on your **PostgreSQL database** (not the web service)
3. Click the **"Connect"** tab
4. You'll see several connection strings. You need the **"External Connection String"**

It looks like this:
```
postgresql://postgres:YOUR_PASSWORD@dpg-xxxxx-a.oregon-postgres.render.com:5432/drinksdb_xxxx
```

## Step 2: Parse the Connection String

Break it down like this:

**Example connection string:**
```
postgresql://postgres:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com:5432/drinksdb_xxxx
```
postgresql://drinksdb_81xl_user
g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp
dpg-d4b4d47gi27c7394kvog-a.virginia-postgres.render.com
drinksdb_81xl

**How to break it down:**
- Everything after `postgresql://` and before `:` = **Username** → `postgres`
- Everything after the first `:` and before `@` = **Password** → `abc123xyz`
- Everything after `@` and before the next `:` = **Host** → `dpg-xxxxx-a.oregon-postgres.render.com`
- Everything after the second `:` and before `/` = **Port** → `5432`
- Everything after the final `/` = **Database** → `drinksdb_xxxx`

## Step 3: Enter in pgAdmin

1. **Open pgAdmin 4**

2. **Right-click "Servers"** in the left sidebar
   - Click **"Create"** → **"Server..."**

3. **"General" Tab:**
   - **Name**: `DrinksDB Render` (or any name)

4. **"Connection" Tab** (THIS IS WHERE YOU ENTER THE DETAILS):
   
   **Host name/address field:**
   - Paste ONLY the host part: `dpg-xxxxx-a.oregon-postgres.render.com`
   - ⚠️ **DO NOT include** `postgresql://` or `http://` or anything else
   - ⚠️ **DO NOT include** the port number here
   - Just the hostname: `dpg-xxxxx-a.oregon-postgres.render.com`
   
   **Port field:**
   - Type: `5432` (or the port from your connection string)
   
   **Maintenance database field:**
   - Paste the database name: `drinksdb_xxxx`
   - This is the part after the final `/` in the connection string
   
   **Username field:**
   - Type: `postgres` (or the username from your connection string)
   
   **Password field:**
   - Paste the password: `abc123xyz` (the part between `:` and `@`)
   - ⚠️ Make sure you copy the ENTIRE password - it might be long
   
   **Check "Save password"** (optional)

5. **Click "Save"**

## Common Mistakes That Cause getaddrinfo Failed

### ❌ Wrong: Including protocol
```
Host: postgresql://dpg-xxxxx-a.oregon-postgres.render.com
```
**Should be:**
```
Host: dpg-xxxxx-a.oregon-postgres.render.com
```

### ❌ Wrong: Including port in host field
```
Host: dpg-xxxxx-a.oregon-postgres.render.com:5432
```
**Should be:**
```
Host: dpg-xxxxx-a.oregon-postgres.render.com
Port: 5432
```

### ❌ Wrong: Using Internal URL instead of External
- Make sure you're using the **"External Connection String"** from Render
- NOT the "Internal Database URL" (that's only for services on Render)

### ❌ Wrong: Incomplete hostname
```
Host: dpg-xxxxx-a
```
**Should be the full hostname:**
```
Host: dpg-xxxxx-a.oregon-postgres.render.com
```

## Step 4: Test the Connection

After clicking "Save", pgAdmin will try to connect. If you see the error again:

1. **Double-check the hostname** - copy it directly from Render, don't type it
2. **Check your internet connection** - you need to be able to reach Render's servers
3. **Verify the database exists** - go back to Render dashboard and make sure the database is running
4. **Check the password** - make sure you copied the entire password (they can be long)

## Alternative: Use the Connection String Directly

If pgAdmin keeps giving you trouble, you can also:

1. In pgAdmin, right-click "Servers" → "Create" → "Server..."
2. In the "Connection" tab, look for a **"Connection string"** field or button
3. If available, paste the entire connection string there:
   ```
   postgresql://postgres:password@host:5432/database
   ```

## Still Having Issues?

1. **Verify the connection string works** - Try using `psql` command line:
   ```bash
   psql "postgresql://postgres:password@host:5432/database"
   ```
   If this works, the issue is with pgAdmin. If this fails, the issue is with the connection string.

2. **Check Render dashboard** - Make sure:
   - Database status is "Available"
   - You're using the External connection string
   - The database hasn't been deleted

3. **Try a different tool** - You can also use:
   - DBeaver (free database tool)
   - TablePlus (Mac/Windows)
   - Or just use `psql` command line

## Quick Checklist

Before connecting, make sure:
- [ ] You have a PostgreSQL database created on Render
- [ ] You're using the **External Connection String** (not Internal)
- [ ] You've parsed the connection string correctly
- [ ] Host field contains ONLY the hostname (no `postgresql://`, no port)
- [ ] Port field contains ONLY the number (usually `5432`)
- [ ] Database field contains ONLY the database name (after the final `/`)
- [ ] Username and password are correct
- [ ] Your internet connection is working

