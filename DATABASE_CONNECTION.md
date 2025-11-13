# Database Connection Guide

## Option 1: Connect Using pgAdmin 4 (GUI - Recommended)

### For Local Database (Your Current Setup)

1. **Open pgAdmin 4**
   - You should see a left sidebar with "Servers" at the top

2. **Create a New Server Connection**
   - In the left sidebar, find "Servers" (usually at the top)
   - **Right-click** on "Servers"
   - In the context menu, hover over "Create"
   - Click **"Server..."**

3. **A dialog window will open with multiple tabs**

4. **Fill in the "General" Tab** (first tab)
   - **Name**: Type `DrinksDB Local` (or any name you prefer - this is just a label)
   - Leave other fields as default
   - Click the **"Connection"** tab at the top

5. **Fill in the "Connection" Tab** (second tab)
   - **Host name/address**: Type `localhost`
   - **Port**: Type `5432`
   - **Maintenance database**: Type `drinksDB` (this is your database name)
   - **Username**: Type `postgres` (or your PostgreSQL username)
   - **Password**: Type `poopbutt` (or your PostgreSQL password)
   - ✅ **Check the box** "Save password" if you want (so you don't have to enter it every time)

6. **Click "Save"** button at the bottom right

7. **Connect**
   - In the left sidebar, you'll see your new server appear under "Servers"
   - **Click the arrow** next to the server name to expand it
   - **Click the arrow** next to "Databases" to expand
   - **Click on** `drinksDB` to select it
   - You're connected! ✅

### For Render Database (Deployed)

1. **Get Connection Details from Render**
   - Go to your Render dashboard
   - Click on your PostgreSQL database
   - Go to the "Connect" tab
   - Copy the "External Connection String" (looks like: `postgresql://user:password@host:port/dbname`)

2. **Parse the Connection String**
   The connection string format is:
   ```
   postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
   ```
   
   Example:
   ```
   postgresql://postgres:abc123@dpg-xxxxx-a.oregon-postgres.render.com:5432/drinksdb_xxxx
   ```
   
   Break it down:
   - **Username**: `postgres` (part before the `:` after `postgresql://`)
   - **Password**: `abc123` (part after the `:` and before the `@`)
   - **Host**: `dpg-xxxxx-a.oregon-postgres.render.com` (part after `@` and before `:`)
   - **Port**: `5432` (part after the second `:` and before `/`)
   - **Database**: `drinksdb_xxxx` (part after the final `/`)

3. **Create Server Connection in pgAdmin**
   - In the left sidebar, **right-click** on "Servers"
   - Hover over "Create" → Click **"Server..."**
   
   **In the dialog window:**
   
   **"General" Tab** (first tab):
   - **Name**: Type `DrinksDB Render` (or any name you prefer)
   - Click the **"Connection"** tab
   
   **"Connection" Tab** (second tab):
   - **Host name/address**: Paste the host part (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
   - **Port**: Type `5432` (or the port number from your connection string)
   - **Maintenance database**: Paste the database name (e.g., `drinksdb_xxxx`)
   - **Username**: Type `postgres` (or the username from your connection string)
   - **Password**: Paste the password (e.g., `abc123`)
   - ✅ Check "Save password" if you want
   
   **"Advanced" Tab** (optional - usually not needed):
   - Leave everything as default
   
   - Click **"Save"** button at the bottom right

4. **Connect and Run SQL**
   - In the left sidebar, expand your new server (click the arrow)
   - Expand "Databases" (click the arrow)
   - **Right-click** on your database name
   - Click **"Query Tool"** from the context menu
   - A new tab will open where you can paste SQL
   - Paste your SQL and click the **"Execute"** button (▶️) or press **F5**

## Option 2: Connect Using psql (Command Line)

### For Local Database

```bash
# Basic connection
psql -h localhost -U postgres -d drinksDB

# Or if PostgreSQL is in your PATH
psql -U postgres -d drinksDB

# You'll be prompted for password
```

### For Render Database

1. **Get Connection String from Render**
   - Copy the "External Connection String" from Render dashboard

2. **Connect Directly**
   ```bash
   # Method 1: Use the full connection string
   psql "postgresql://user:password@host:port/database"
   
   # Method 2: Use individual parameters
   psql -h dpg-xxxxx-a.oregon-postgres.render.com -U postgres -d drinksdb_xxxx -p 5432
   ```

3. **Run SQL Files**
   ```bash
   # From your project directory
   psql "postgresql://user:password@host:port/database" -f database/commands.sql
   psql "postgresql://user:password@host:port/database" -f database/seed_data_new.sql
   psql "postgresql://user:password@host:port/database" -f database/game_night_menu.sql
   ```

### Installing psql (if not installed)

**Windows:**
- Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
- Or use the PostgreSQL installer you already have
- psql comes with PostgreSQL installation

**macOS:**
```bash
brew install postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql-client  # Ubuntu/Debian
sudo yum install postgresql  # CentOS/RHEL
```

## Running SQL Files

### In pgAdmin:
1. Connect to your database
2. Right-click database → "Query Tool"
3. Click the folder icon (📁) to open a file
4. Select your SQL file (e.g., `database/commands.sql`)
5. Click "Execute" (▶️) or press F5

### Using psql:
```bash
# Navigate to your project directory
cd C:\Users\zachr\projects\DrinksDB

# Run SQL files in order
psql -h localhost -U postgres -d drinksDB -f database/commands.sql
psql -h localhost -U postgres -d drinksDB -f database/seed_data_new.sql
psql -h localhost -U postgres -d drinksDB -f database/game_night_menu.sql
```

## Troubleshooting

### "Connection refused" error
- Make sure PostgreSQL is running
- Check the host/port are correct
- For Render: Make sure you're using the "External" connection string, not "Internal"

### "Authentication failed"
- Double-check username and password
- For Render: The password might have special characters - use quotes around connection string

### "Database does not exist"
- Make sure you're connecting to the right database name
- For Render: The database name might be different from what you expect (check the connection string)

### Can't find psql command
- Make sure PostgreSQL is installed
- Add PostgreSQL bin directory to your PATH
- On Windows, it's usually: `C:\Program Files\PostgreSQL\XX\bin`

## Quick Reference

**Local Connection:**
- Host: `localhost`
- Port: `5432`
- Database: `drinksDB`
- User: `postgres`
- Password: `poopbutt` (or your local password)

**Render Connection:**
- Get details from Render dashboard → Database → Connect tab
- Use "External Connection String" for local tools
- Use "Internal Database URL" for backend environment variables

