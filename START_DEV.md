# Development Setup Guide

## Starting the Development Servers

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm install  # Only needed first time or after package changes
npm run dev  # or npm start
```

The backend should start on `http://localhost:3001`

**Troubleshooting:**
- If you see database connection errors, make sure your `.env` file in the `backend` folder has the correct database credentials
- Check that PostgreSQL is accessible (if using local DB) or that the Render database URL is correct

### 2. Start the Frontend Server

Open a **separate** terminal and run:

```bash
cd frontend
npm install  # Only needed first time or after package changes
npm run dev
```

The frontend should start on `http://localhost:3000`

The Vite proxy will automatically forward `/api/*` requests to the backend at `http://localhost:3001`

### 3. Verify Connection

1. Check browser console for any errors
2. The frontend should automatically fetch drinks from `/api/drinks`
3. You should see API request logs in both:
   - Browser console (frontend logs)
   - Terminal running backend (server logs)

## Common Issues

### Backend not responding
- Make sure backend is running on port 3001
- Check backend terminal for errors
- Verify database connection is working

### CORS errors
- Backend CORS is configured to allow `localhost:3000` and `localhost:5173`
- In development mode, all origins are allowed
- If you see CORS errors, check backend logs

### Proxy not working
- Make sure Vite dev server is running
- Check `frontend/vite.config.js` proxy configuration
- Restart the frontend dev server after changing vite.config.js

### Port already in use
- If port 3001 is in use, change `PORT` in backend `.env` file
- If port 3000 is in use, change `port` in `frontend/vite.config.js`


