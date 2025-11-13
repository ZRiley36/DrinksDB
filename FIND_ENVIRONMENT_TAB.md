# How to Find Environment Variables in Render

## Step-by-Step Instructions

### Step 1: Go to Render Dashboard

1. Go to [render.com](https://render.com)
2. Log in
3. You should see a list of your services

### Step 2: Find Your Backend Service

Look for a service that says:
- **Type**: "Web Service" (NOT "PostgreSQL")
- **Name**: Something like `drinksdb` or `drinksdb-backend`
- **Status**: Should say "Live" or "Deploying"

**It should NOT be:**
- The one that says "PostgreSQL" as the type
- The one that's just a database

### Step 3: Click on the Backend Service

Click on the **Web Service** (not the database)

### Step 4: Look for Tabs at the Top

After clicking your backend service, you should see tabs at the top:
- **Overview** (default)
- **Logs**
- **Events**
- **Metrics**
- **Environment** ← **THIS IS THE ONE!**
- **Settings**

### Step 5: Click "Environment" Tab

Click the **"Environment"** tab

### Step 6: You Should See

You should see:
- A list of environment variables (if any exist)
- An **"Add Environment Variable"** button (usually at the top or bottom)

### Step 7: Add DB_NAME

1. Click **"Add Environment Variable"**
2. **Key**: Type `DB_NAME`
3. **Value**: Type `drinksdb_81xl`
4. Click **"Save Changes"** or **"Add"**

## What If You Don't See "Environment" Tab?

### Option 1: You're Looking at the Wrong Service

- Make sure you clicked the **Web Service**, not the PostgreSQL database
- The database service doesn't have an Environment tab

### Option 2: Check Settings Tab

Sometimes environment variables are in Settings:
1. Click **"Settings"** tab
2. Scroll down
3. Look for **"Environment Variables"** section

### Option 3: You Haven't Created the Backend Service Yet

If you only see a PostgreSQL database and no Web Service:
- You need to create the backend service first
- See `DEPLOYMENT.md` for instructions on creating the backend service

## Visual Guide

```
Render Dashboard
│
├── PostgreSQL (drinksdb) ← Don't use this one
│   └── Tabs: Overview, Logs, Settings
│       └── No "Environment" tab here!
│
└── Web Service (drinksdb-backend) ← Use this one!
    └── Tabs: Overview, Logs, Events, Metrics, Environment, Settings
        └── Click "Environment" tab
            └── Add Environment Variable button
                └── Add: DB_NAME = drinksdb_81xl
```

## Still Can't Find It?

1. **Take a screenshot** of what you see in Render
2. **Or describe** what tabs/options you see
3. I can help you navigate from there

## Quick Checklist

- [ ] Logged into render.com
- [ ] Found the Web Service (not PostgreSQL)
- [ ] Clicked on the Web Service
- [ ] See tabs at the top (Overview, Logs, Environment, etc.)
- [ ] Clicked "Environment" tab
- [ ] See "Add Environment Variable" button
- [ ] Added DB_NAME = drinksdb_81xl

## Alternative: Check if Service Exists

If you can't find a Web Service at all:

1. **Go to Render dashboard**
2. **Look at the list of services**
3. **Do you see:**
   - ✅ A PostgreSQL database? (You have this)
   - ❌ A Web Service? (You might need to create this)

If you don't have a Web Service, you need to create it first. Let me know and I can help with that!

