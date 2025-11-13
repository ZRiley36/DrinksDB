# Render Environment Variables Guide

## The Key Difference: Internal vs External

When setting up your backend on Render, you need to understand the difference:

### **Internal Database URL** (for Backend Service on Render)
- Used by: Your backend service running on Render
- Where to find: Render dashboard → Database → "Connect" tab → **"Internal Database URL"**
- Format: Usually shorter, like `postgresql://user:pass@hostname:5432/dbname`
- Why: Services on Render can communicate faster using internal networking

### **External Connection String** (for Local Tools)
- Used by: pgAdmin, psql, or any tool running on your local machine
- Where to find: Render dashboard → Database → "Connect" tab → **"External Connection String"**
- Format: Full hostname, like `postgresql://user:pass@dpg-xxxxx-a.region-postgres.render.com:5432/dbname`
- Why: Your local machine needs the full hostname to reach Render's servers

## Setting Up Backend Environment Variables

### Step 1: Get Internal Database URL

1. Go to Render dashboard
2. Click on your **PostgreSQL database**
3. Click **"Connect"** tab
4. Copy the **"Internal Database URL"**

Example Internal URL:
```
postgresql://drinksdb_81xl_user:g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp@dpg-d4b4d47gi27c7394kvog-a:5432/drinksdb_81xl
```

### Step 2: Parse the Internal URL

Break it down:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

From the example above:
- **Username**: `drinksdb_81xl_user`
- **Password**: `g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp`
- **Host**: `dpg-d4b4d47gi27c7394kvog-a` (note: no `.render.com` in internal URL)
- **Port**: `5432`
- **Database**: `drinksdb_81xl`

### Step 3: Set Environment Variables in Render Backend Service

When creating/editing your backend service on Render:

1. Go to your backend service → "Environment" tab
2. Add these variables:

```
NODE_ENV=production
PORT=3001
DB_USER=drinksdb_81xl_user
DB_HOST=dpg-d4b4d47gi27c7394kvog-a
DB_NAME=drinksdb_81xl
DB_PASSWORD=g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp
DB_PORT=5432
FRONTEND_URL=https://your-app.vercel.app
```

**Note**: The PORT is `3001` (your backend port), NOT `5432` (database port). The database port `5432` goes in `DB_PORT`.

## Quick Reference

| Variable | Value Source | Example |
|----------|-------------|---------|
| `DB_USER` | Internal URL (before `:`) | `drinksdb_81xl_user` |
| `DB_PASSWORD` | Internal URL (between `:` and `@`) | `g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp` |
| `DB_HOST` | Internal URL (after `@`, before `:`) | `dpg-d4b4d47gi27c7394kvog-a` |
| `DB_PORT` | Internal URL (after second `:`, before `/`) | `5432` |
| `DB_NAME` | Internal URL (after final `/`) | `drinksdb_81xl` |
| `PORT` | Your backend port (not database) | `3001` |

## Common Mistakes

### ❌ Wrong: Using External URL for Backend
```
DB_HOST=dpg-d4b4d47gi27c7394kvog-a.virginia-postgres.render.com
```
**Should be (Internal):**
```
DB_HOST=dpg-d4b4d47gi27c7394kvog-a
```

### ❌ Wrong: Using Database Port for Backend PORT
```
PORT=5432  # This is the database port!
```
**Should be:**
```
PORT=3001  # Your backend port
DB_PORT=5432  # Database port goes here
```

### ❌ Wrong: Using Wrong Database Name
```
DB_NAME=drinksDB  # Your local database name
```
**Should be:**
```
DB_NAME=drinksdb_81xl  # From the Render connection string
```

## For pgAdmin (Local Connection)

When connecting from pgAdmin on your local machine, use the **External Connection String**:

1. Render dashboard → Database → "Connect" tab
2. Copy **"External Connection String"**
3. Use that in pgAdmin (see `RENDER_CONNECTION_GUIDE.md`)

Example External URL:
```
postgresql://drinksdb_81xl_user:g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp@dpg-d4b4d47gi27c7394kvog-a.virginia-postgres.render.com:5432/drinksdb_81xl
```

Notice the full hostname: `dpg-d4b4d47gi27c7394kvog-a.virginia-postgres.render.com`

## Summary

- **Backend on Render** → Use **Internal Database URL**
- **pgAdmin/psql on your computer** → Use **External Connection String**
- **PORT=3001** (your backend) vs **DB_PORT=5432** (database)
- **DB_NAME** comes from the connection string, not your local database name

