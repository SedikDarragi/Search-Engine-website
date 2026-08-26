# Search Engine

A full-stack search engine application with React frontend and Node.js/Express backend.
for a website demo click [Here](https://local-search-engine.netlify.app)
currently the backend is not fully function on the website, so it's a work in progress.

## Features

- Full-text search functionality
- Image search capabilities
- User authentication
- Search history
- Responsive design

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend-react
   npm install
   ```

3. Set up environment variables:
   ```bash
   # backend/.env (see backend/.env.example)
   cp backend/.env.example backend/.env
   # then edit MONGODB_URI and FRONTEND_URL

   # frontend-react/.env (optional locally — leave REACT_APP_API_URL empty to use CRA proxy)
   cp frontend-react/.env.example frontend-react/.env
   ```

4. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # In a new terminal, start frontend (from frontend-react directory)
   npm start
   ```

## Environment Variables

### Backend (`backend/.env`)
```
MONGODB_URI=your_mongodb_connection_string  # required
PORT=3000                                  # Render injects automatically; 3000 for local
FRONTEND_URL=http://localhost:3001,http://localhost:3000  # comma-separated allowed origins
NODE_ENV=development
```

### Frontend (`frontend-react/.env`)
```
# Local dev — blank = use CRA proxy to http://localhost:3000
REACT_APP_API_URL=http://localhost:3000
# Production (Netlify) — set to your Render backend URL
REACT_APP_API_URL=https://your-api.onrender.com
```

## Deployment

### Backend → Render
1. Push to GitHub. Render detects `render.yaml`.
2. In Render Dashboard → New Web Service → connect repo → `Root Directory: backend`.
3. Set env vars: `MONGODB_URI` (Atlas URI), `FRONTEND_URL` (your Netlify URL e.g. `https://local-search-engine.netlify.app`), `NODE_ENV=production`.
4. Build: `npm ci` · Start: `npm start` · Health check: `/api/health`.
5. (Optional) Seed DB once: `MONGODB_URI=... node seed.js` locally or via Render Shell.

### Frontend → Netlify
1. Netlify → Add new site → Import from Git.
2. `netlify.toml` is preconfigured:
   - Base: `frontend-react`
   - Build: `npm ci && npm run build`
   - Publish: `frontend-react/build`
   - SPA redirect `/* → /index.html` via `netlify.toml` + `public/_redirects`.
3. Set env var in Netlify: `Site settings → Environment variables → REACT_APP_API_URL=https://your-api.onrender.com`.
4. Deploy. Check browser console for API URL: `https://your-api.onrender.com/api/health` should return `{"status":"healthy"}`.

### Local production sanity check
```bash
# backend
MONGODB_URI=... FRONTEND_URL=http://localhost:3001 node backend/server.js
curl http://localhost:3000/api/health

# frontend
REACT_APP_API_URL=http://localhost:3000 npm --prefix frontend-react run build
npx serve -s frontend-react/build
```

## License

MIT
