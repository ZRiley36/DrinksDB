# DrinksDB Web App Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database with DrinksDB schema and data loaded
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=drinksdb
   DB_PASSWORD=your_password_here
   DB_PORT=5432
   PORT=3001
   ```

4. Start the backend server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

   The API will be available at `http://localhost:3001`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/drinks` - Get all drinks
- `GET /api/drinks/:name` - Get drink details by name (includes ingredients)
- `GET /api/drinks/search/:query` - Search drinks by name
- `GET /api/health` - Health check

## Features

- **Drink List**: Browse all available cocktails
- **Search**: Search for drinks by name
- **Drink Details**: Click any drink to see:
  - Glass type
  - Build method
  - Garnish
  - Complete ingredient list with amounts

## Development

- Backend uses Express.js with PostgreSQL
- Frontend uses React with Vite
- API proxy configured in Vite for seamless development

