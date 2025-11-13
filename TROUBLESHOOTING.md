# Troubleshooting "Failed to fetch" Error

## The Error
```
Failed to load drinks: Network error: Cannot reach https://drinksdb.onrender.com/api/drinks
```

## Common Issues and Fixes

### Issue 1: Wrong Backend URL

**Problem**: The URL `https://drinksdb.onrender.com` might be incorrect.

**Check:**
1. Go to your Render dashboard
2. Click on your backend service (should be named `drinksdb-backend`)
3. Copy the service URL (should look like `https://drinksdb-backend.onrender.com`)

**Fix:**
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `VITE_API_URL` to match your actual Render backend URL
3. Make sure it includes `https://` and ends with `.onrender.com`
4. Example: `https://drinksdb-backend.onrender.com` (NOT `drinksdb.onrender.com`)
5. Redeploy on Vercel

### Issue 2: Backend Not Running

**Check:**
1. Go to Render dashboard → Your backend service
2. Check the "Logs" tab
3. Look for errors or see if it says "Server running on http://localhost:3001"

**Fix:**
- If there are errors, check the logs
- Make sure environment variables are set correctly
- Make sure the database is connected

### Issue 3: CORS Not Configured

**Check:**
1. In Render backend service → Environment Variables
2. Make sure `FRONTEND_URL` is set to your Vercel URL
3. Example: `https://your-app.vercel.app`

**Fix:**
1. Get your Vercel frontend URL
2. Go to Render → Backend service → Environment → Add/Edit
3. Set `FRONTEND_URL` to your Vercel URL (e.g., `https://drinksdb.vercel.app`)
4. Redeploy the backend

### Issue 4: Backend Spun Down (Free Tier)

**Problem**: Render free tier services spin down after 15 minutes of inactivity.

**Check:**
1. Try accessing your backend URL directly in browser: `https://your-backend.onrender.com/api/health`
2. If it takes a long time to load, it's spinning up

**Fix:**
- First request after spin-down takes ~30 seconds
- Consider upgrading to paid tier for always-on service
- Or just wait for the first request to wake it up

### Issue 5: Database Connection Failed

**Check:**
1. Render backend logs should show "Database connected successfully"
2. If you see database errors, check your environment variables

**Fix:**
- Verify all database environment variables are set
- Make sure you're using the **Internal Database URL** (not External)
- Check that the database is running in Render dashboard

## Quick Checklist

- [ ] Backend URL in Vercel matches Render service URL exactly
- [ ] Backend service is running (check Render logs)
- [ ] `FRONTEND_URL` is set in Render backend environment variables
- [ ] Database is connected (check backend logs)
- [ ] Backend has been deployed successfully
- [ ] Vercel has been redeployed after setting `VITE_API_URL`

## Testing Steps

1. **Test backend directly:**
   - Open: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"ok"}`

2. **Test API endpoint:**
   - Open: `https://your-backend.onrender.com/api/drinks`
   - Should return JSON array of drinks

3. **Check browser console:**
   - Open your Vercel site
   - Open browser console (F12)
   - Look for the debug logs we added
   - Check what URL it's trying to reach

4. **Check CORS:**
   - In browser console, look for CORS errors
   - If you see CORS errors, make sure `FRONTEND_URL` is set in Render

## Still Not Working?

1. **Check Render backend logs:**
   - Go to Render → Backend service → Logs
   - Look for any errors or connection issues

2. **Check Vercel build logs:**
   - Go to Vercel → Your project → Deployments
   - Click on latest deployment → View build logs
   - Make sure `VITE_API_URL` was set during build

3. **Verify environment variables:**
   - Render backend: `FRONTEND_URL` should be your Vercel URL
   - Vercel frontend: `VITE_API_URL` should be your Render backend URL

4. **Test locally:**
   - Set `VITE_API_URL` in a local `.env` file
   - Run `npm run dev` in frontend
   - See if it can reach the Render backend

