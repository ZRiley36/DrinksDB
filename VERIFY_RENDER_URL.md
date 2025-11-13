# How to Find Your Actual Render Backend URL

## Step 1: Check Your Render Service URL

1. **Go to [render.com](https://render.com) and log in**

2. **Click on your backend service** (whatever it's named - could be `drinksdb` or `drinksdb-backend`)

3. **Look at the top of the page** - you should see:
   - Service name
   - **Service URL** (this is what you need!)

4. **The URL format is:**
   ```
   https://[service-name].onrender.com
   ```
   
   So if your service is named `drinksdb`, the URL is `https://drinksdb.onrender.com`
   If it's named `drinksdb-backend`, the URL is `https://drinksdb-backend.onrender.com`

## Step 2: Test the Backend URL

Open this in your browser (replace with your actual URL):
```
https://drinksdb.onrender.com/api/health
```

You should see:
```json
{"status":"ok"}
```

If that works, try:
```
https://drinksdb.onrender.com/api/drinks
```

You should see a JSON array of drinks.

## Step 3: Update Vercel Environment Variable

1. **Go to [vercel.com](https://vercel.com) and log in**

2. **Click on your project**

3. **Go to Settings → Environment Variables**

4. **Find `VITE_API_URL`** (or add it if it doesn't exist)

5. **Set it to your Render backend URL:**
   ```
   https://drinksdb.onrender.com
   ```
   (Use whatever your actual Render service URL is)

6. **Make sure:**
   - ✅ Includes `https://`
   - ✅ No trailing slash
   - ✅ Matches exactly what Render shows

7. **Click "Save"**

8. **Redeploy** - Vercel will ask if you want to redeploy, click "Redeploy"

## Step 4: Verify It's Working

After redeploying:

1. **Open your Vercel site**

2. **Open browser console** (F12 → Console tab)

3. **Look for the debug logs** - you should see:
   ```
   🔧 API Configuration: {
     VITE_API_URL: "https://drinksdb.onrender.com",
     API_BASE_URL: "https://drinksdb.onrender.com",
     ...
   }
   ```

4. **Check if API calls work** - you should see:
   ```
   🌐 API Request: {
     fullUrl: "https://drinksdb.onrender.com/api/drinks",
     ...
   }
   ```

## Common Issues

### URL Works in Browser But Not in App

If `https://drinksdb.onrender.com/api/health` works in your browser but not in the app:
- **CORS issue** - Make sure `FRONTEND_URL` is set in Render backend environment variables
- Set `FRONTEND_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)

### Service Spinning Up

If the first request takes 30+ seconds:
- Render free tier services spin down after 15 min of inactivity
- First request wakes them up (takes ~30 seconds)
- Subsequent requests are fast

### Still Getting "Failed to fetch"

1. **Check Render backend logs:**
   - Render dashboard → Your service → Logs tab
   - Look for errors or "Server running" message

2. **Check CORS:**
   - Make sure `FRONTEND_URL` is set in Render
   - Should be your Vercel frontend URL

3. **Verify the URL:**
   - Test in browser: `https://drinksdb.onrender.com/api/health`
   - Should return `{"status":"ok"}`

## Quick Checklist

- [ ] Found actual Render service URL in dashboard
- [ ] Tested backend URL in browser (`/api/health` works)
- [ ] Updated `VITE_API_URL` in Vercel to match Render URL
- [ ] Set `FRONTEND_URL` in Render to your Vercel URL
- [ ] Redeployed both services
- [ ] Checked browser console for debug logs

