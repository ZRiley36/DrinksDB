# How to Change Root Directory in Render

## Quick Steps

1. **Go to [render.com](https://render.com) and log in**

2. **Click on your backend service** (e.g., `drinksdb-backend`)

3. **Click the "Settings" tab** (in the top navigation)

4. **Scroll down to find "Root Directory"** section

5. **Enter `backend`** in the Root Directory field
   - Just type: `backend`
   - Don't include a leading slash
   - Don't include quotes

6. **Click "Save Changes"** button at the bottom

7. **Render will automatically redeploy** your service with the new settings

## Visual Guide

```
Render Dashboard
└── Your Service (drinksdb-backend)
    └── Settings Tab
        └── Scroll down to:
            Root Directory: [backend]  ← Type "backend" here
            Build Command: [npm install]
            Start Command: [npm start]
            [Save Changes]  ← Click this
```

## What Happens After

Once you save:
- Render will start a new deployment
- It will look for `package.json` in the `backend` folder
- Build and start commands will run from the `backend` directory
- You'll see the deployment progress in the "Events" or "Logs" tab

## Verify It Worked

After the deployment completes:

1. **Check the "Logs" tab**
   - You should see: `Installing dependencies` or `npm install`
   - Then: `Starting service` or `npm start`
   - Finally: `Server running on http://localhost:3001`

2. **If you see errors about package.json not found**, the Root Directory might not have saved correctly
   - Go back to Settings and verify it says `backend`
   - Make sure there are no extra spaces or characters

## Common Mistakes

### ❌ Wrong:
- `backend/` (with trailing slash)
- `/backend` (with leading slash)
- `./backend` (with dot-slash)
- `backend ` (with trailing space)

### ✅ Correct:
- `backend` (just the folder name)

## If You Can't Find Root Directory

If you don't see a "Root Directory" field:

1. Make sure you're in the **Settings** tab (not Overview or Logs)
2. Scroll down - it's usually below the Build & Deploy section
3. If it's still not there, try:
   - Click "Edit" or "Configure" if there's a button
   - Or delete and recreate the service with the correct root directory

## Alternative: Recreate the Service

If changing the root directory doesn't work:

1. **Note down your environment variables** (copy them somewhere)
2. **Delete the current service** (Settings → Danger Zone → Delete)
3. **Create a new Web Service**
4. **Set Root Directory to `backend`** during creation
5. **Re-add all your environment variables**
6. **Deploy**

But try changing it first - it's much easier!

