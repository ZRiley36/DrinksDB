# How to Redeploy Your Vercel App

## Method 1: Automatic Redeploy (Recommended)

Vercel automatically redeploys when you push to GitHub:

1. **Make sure your code is pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Update for deployment"
   git push
   ```

2. **Vercel will automatically detect the push and redeploy**
   - Go to your Vercel dashboard
   - You'll see a new deployment starting automatically
   - Wait for it to complete (usually 1-2 minutes)

## Method 2: Manual Redeploy from Dashboard

1. **Go to [vercel.com](https://vercel.com) and log in**

2. **Click on your project** (DrinksDB or whatever you named it)

3. **Go to the "Deployments" tab**

4. **Find the latest deployment** (or any deployment you want to redeploy)

5. **Click the three dots (⋯) menu** on that deployment

6. **Click "Redeploy"**

7. **Confirm the redeploy**

8. **Wait for it to complete** - you'll see the build logs in real-time

## Method 3: Redeploy After Changing Environment Variables

If you just updated environment variables (like `VITE_API_URL`):

1. **Go to your project in Vercel dashboard**

2. **Click "Settings"** → **"Environment Variables"**

3. **Make sure your variables are set:**
   - `VITE_API_URL` = `https://your-backend.onrender.com`

4. **After saving environment variables, Vercel will ask if you want to redeploy**
   - Click **"Redeploy"** to apply the new variables immediately
   - Or it will use them on the next automatic deployment

## Method 4: Trigger via Vercel CLI (Advanced)

If you have Vercel CLI installed:

```bash
vercel --prod
```

## Checking Your Deployment

After redeploying:

1. **Go to your project → "Deployments" tab**
2. **Click on the latest deployment**
3. **Check the build logs** to make sure everything built successfully
4. **Click "Visit"** to see your live site
5. **Test the app** - make sure API calls work

## Common Issues

### Environment Variables Not Updating
- Make sure you saved the environment variables
- Redeploy after changing them (Vercel will prompt you)
- Environment variables are baked into the build, so you need to rebuild

### Build Failing
- Check the build logs in Vercel dashboard
- Make sure `VITE_API_URL` is set correctly
- Verify your frontend code is pushed to GitHub

### API Calls Not Working
- Check browser console for errors
- Verify `VITE_API_URL` points to your Render backend
- Make sure your Render backend is running and accessible

## Quick Checklist

Before redeploying:
- [ ] Environment variables are set in Vercel (`VITE_API_URL`)
- [ ] Your Render backend is deployed and running
- [ ] Your code is pushed to GitHub
- [ ] You have the correct backend URL

After redeploying:
- [ ] Build completed successfully
- [ ] Site is accessible
- [ ] API calls work (check browser console)
- [ ] No errors in Vercel logs

