# Deployment Guide for DrinksDB

## ✅ Setup Complete!

Your project is now configured for deployment. The frontend uses environment variables to connect to your backend, and configuration files are ready.

## Deployment Strategy

Since you already have **Vercel** linked to GitHub, we'll use:
- **Frontend**: Vercel (already set up!)
- **Backend**: Render (free tier, easy setup)
- **Database**: Render PostgreSQL (included with backend)

## Step-by-Step Deployment

### Part 1: Deploy Backend to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (same account as Vercel)

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `drinksdb`
   - Database: `drinksDB`
   - User: `postgres` (default)
   - Region: Choose closest to you
   - Plan: **Free**
   - Click "Create Database"
   - ⚠️ **Copy the connection details** (you'll need them!)

3. **Set Up Database**
   - In Render dashboard, click on your database
   - Go to "Connect" tab
   - Copy the "Internal Database URL" (for backend)
   - Copy the "External Connection String" (for local setup)


4. **Run Database Migrations**
   - You can use Render's PostgreSQL shell or connect locally:
   ```bash
   # Connect using psql (if you have it installed)
   psql <your-external-connection-string>
   ```
   - Or use pgAdmin 4 with the external connection string
   - Run these SQL files in order:
     1. `database/commands.sql` (creates tables)
     2. `database/seed_data_new.sql` (populates drinks)
     3. `database/game_night_menu.sql` (adds menu)

5. **Deploy Backend Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: `drinksdb-backend`
     - **Environment**: `Node`
     - **Root Directory**: `backend` ⚠️ **IMPORTANT: Set this to `backend`**
     - **Build Command**: `npm install` (leave as default, or clear it)
     - **Start Command**: `npm start` (leave as default, or clear it)
     - **Plan**: **Free**
   - Add Environment Variables:
     ```
     NODE_ENV=production
     PORT=3001
     DB_USER=<from INTERNAL database connection>
     DB_HOST=<from INTERNAL database connection>
     DB_NAME=drinksDB
     DB_PASSWORD=<from INTERNAL database connection>
     DB_PORT=5432
     FRONTEND_URL=<your-vercel-url> (we'll add this after frontend deploys)
     ```
   - ⚠️ **IMPORTANT**: Use the **"Internal Database URL"** from Render (not External!)
     - Go to your database → "Connect" tab
     - Copy the **"Internal Database URL"** 
     - Parse it the same way, but use those values for DB_USER, DB_HOST, DB_PASSWORD
     - The Internal URL is for services on Render to connect to each other
     - The External URL is only for connecting from your local machine (like pgAdmin)
   - Click "Create Web Service"
   - ⚠️ **Copy the service URL** (e.g., `https://drinksdb-backend.onrender.com`)

### Part 2: Deploy Frontend to Vercel

1. **Push Code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Your repo should already be connected
   - Click "Add New Project" (or "Import" if repo not connected)
   - Select your `DrinksDB` repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Add Environment Variable:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```
     (Replace with your actual Render backend URL)
   - Click "Deploy"

3. **Update Backend CORS** (if needed)
   - After Vercel deploys, copy your frontend URL
   - Go back to Render backend settings
   - Update `FRONTEND_URL` environment variable to your Vercel URL
   - Redeploy backend

### Part 3: Test Everything

1. Visit your Vercel URL
2. Test search, filters, and menu
3. Check browser console for any errors
4. Check Render logs if issues occur

## Environment Variables Reference

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (Render)
```
NODE_ENV=production
PORT=3001
DB_USER=<from INTERNAL connection string>
DB_HOST=<from INTERNAL connection string>
DB_NAME=drinksDB
DB_PASSWORD=<from INTERNAL connection string>
DB_PORT=5432
FRONTEND_URL=https://your-app.vercel.app
```

**⚠️ Important**: 
- Use **"Internal Database URL"** from Render (for backend service)
- Use **"External Connection String"** from Render (for pgAdmin/local tools)
- The Internal URL is shorter and faster for services on Render
- The External URL includes the full hostname for external connections

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly in Vercel
- Verify backend URL is accessible (visit it in browser)
- Check CORS settings in backend

### Database connection errors
- Verify all DB environment variables in Render
- Check database is running (Render dashboard)
- Ensure you've run the SQL migration files

### Build errors
- Check build logs in Vercel/Render
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Cost Estimate

- **Vercel**: Free (hobby plan)
- **Render Backend**: Free (spins down after 15 min inactivity, wakes on request)
- **Render Database**: Free (limited to 90 days, then $7/month)
- **Total**: $0/month (free tier) or $7/month (if you need persistent database)

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Set up custom domain (optional, Vercel makes this easy)
3. ✅ Monitor usage and upgrade if needed
4. ✅ Set up database backups (Render does this automatically)

## Files Created for Deployment

- ✅ `frontend/src/api.js` - API utility with environment variable support
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `render.yaml` - Render deployment configuration (optional, can use UI instead)
- ✅ Updated `App.jsx` and `GameNightMenu.jsx` to use API utility
- ✅ Updated backend CORS to support environment variables

Your app is ready to deploy! 🚀

