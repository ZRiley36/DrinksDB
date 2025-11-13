# Fixing Render Deployment Error

## The Error
```
error Couldn't find a package.json file in "/opt/render/project/src"
```

## The Problem
Render is looking for `package.json` in the wrong directory. Your backend code is in the `backend` folder, but Render is trying to run from the root.

## The Solution

### Option 1: Set Root Directory (Recommended)

1. Go to your Render dashboard
2. Click on your backend service
3. Go to **"Settings"** tab
4. Scroll down to **"Root Directory"**
5. Set it to: `backend`
6. Click **"Save Changes"**
7. Render will automatically redeploy

This tells Render: "The `package.json` and code are in the `backend` folder, so run all commands from there."

### Option 2: Update Build/Start Commands

If you can't set Root Directory, update the commands:

1. Go to your backend service → **"Settings"** tab
2. **Build Command**: Change to `cd backend && npm install`
3. **Start Command**: Change to `cd backend && npm start`
4. Make sure **"Auto-Deploy"** is enabled
5. Save and redeploy

### Option 3: Use render.yaml (Advanced)

If you're using `render.yaml`, make sure it's configured correctly. The file should be in your repo root.

## After Fixing

Once you set the Root Directory to `backend`:
- Render will look for `package.json` in `/opt/render/project/src/backend`
- Build command will run `npm install` from the backend folder
- Start command will run `npm start` from the backend folder

## Verify It's Working

After redeploying, check the logs:
1. Go to your service → **"Logs"** tab
2. You should see:
   ```
   ==> Installing dependencies
   npm install
   ...
   ==> Building
   ...
   ==> Starting service
   npm start
   Server running on http://localhost:3001
   ```

If you still see errors, check:
- The Root Directory is exactly `backend` (case-sensitive)
- Your `backend/package.json` exists and is valid
- Environment variables are set correctly

