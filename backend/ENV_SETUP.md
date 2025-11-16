# Environment Setup for Backend

## Create `.env` file

Create a file named `.env` in the `backend` directory with the following content:

### Option 1: Use Connection String (Recommended for Render)

```env
# Render PostgreSQL Database Connection
DATABASE_URL=postgresql://drinksdb_81xl_user:g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp@dpg-d4b4d47gi27c7394kvog-a.virginia-postgres.render.com/drinksdb_81xl

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Option 2: Use Individual Parameters

```env
# Database Configuration
DB_HOST=dpg-d4b4d47gi27c7394kvog-a.virginia-postgres.render.com
DB_USER=drinksdb_81xl_user
DB_PASSWORD=g3ir6q0JJBWNkU1mDgTsOxGQtA5lG8qp
DB_NAME=drinksdb_81xl
DB_PORT=5432

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Quick Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create the `.env` file (copy one of the options above)

3. Restart your backend server:
   ```bash
   npm run dev
   ```

The database connection should now work!


