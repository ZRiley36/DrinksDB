# Where to Set Environment Variables in Render

## Important: Two Different Services

You have **two separate services** in Render:
1. **PostgreSQL Database** - This is your database
2. **Web Service (Backend)** - This is your Node.js API

Environment variables go in the **Web Service (Backend)**, NOT the database!

## Where to Set DB_NAME

### Step 1: Go to Your Backend Service

1. **Go to Render dashboard**
2. **Click on your WEB SERVICE** (not the database)
   - It should be named something like `drinksdb` or `drinksdb-backend`
   - It should say "Web Service" as the type
   - NOT the one that says "PostgreSQL"

### Step 2: Find Environment Variables

1. **Click on your backend service**
2. **Click "Environment" tab** (in the top navigation)
3. **You should see a list of environment variables here**

### Step 3: Add DB_NAME

1. **Click "Add Environment Variable"** button
2. **Key**: `DB_NAME`
3. **Value**: `drinksdb_81xl`
4. **Click "Save Changes"**

## All Database Environment Variables

Add these in your **backend service** (not database):

```
DB_USER=drinksdb_81xl_user
DB_HOST=dpg-d4b4d47gi27c7394kvog-a
DB_NAME=drinksdb_81xl
DB_PASSWORD=<your-password-from-internal-url>
DB_PORT=5432
```

## How to Get the Values

1. **Go to your PostgreSQL database** (the database service, not backend)
2. **Click "Connect" tab**
3. **Copy "Internal Database URL"**
4. **Parse it:**
   ```
   postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
   ```

## Visual Guide

```
Render Dashboard
├── PostgreSQL Database (drinksdb)
│   └── Connect tab → Get connection string
│
└── Web Service (drinksdb-backend) ← SET ENV VARS HERE
    └── Environment tab
        ├── Add: DB_USER
        ├── Add: DB_HOST
        ├── Add: DB_NAME ← You need this one!
        ├── Add: DB_PASSWORD
        └── Add: DB_PORT
```

## Quick Checklist

- [ ] Went to the **Web Service** (not database)
- [ ] Clicked **"Environment"** tab
- [ ] Added `DB_NAME` = `drinksdb_81xl`
- [ ] Added all other DB variables
- [ ] Clicked "Save Changes"
- [ ] Waited for redeploy

## Common Mistake

❌ **Wrong**: Looking at PostgreSQL database → Settings → General → Name
✅ **Correct**: Backend Web Service → Environment tab → Add `DB_NAME`

The database "Name" is just a label. The environment variables that tell your backend how to connect go in the **backend service**!

