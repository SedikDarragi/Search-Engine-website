# 🔍 IMSET Search Engine

<p align="center">
  <a href="https://searchenginewebsite.netlify.app/"><img src="https://img.shields.io/badge/Live-Demo-4285F4?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo" /></a>
  <a href="https://search-engine-website.onrender.com/api/health"><img src="https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="API" /></a>
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT" />
</p>

<p align="center">
  Full-stack search engine — <b>React SPA</b> + <b>Node.js / Express</b> + <b>MongoDB</b> <br/>
  with full-text search, image search, auth & history. Demo works <b>even without MongoDB</b> (mock fallback).
</p>

<p align="center">
  <b>🌐 Live:</b> <a href="https://searchenginewebsite.netlify.app/">searchenginewebsite.netlify.app</a> &nbsp;|&nbsp;
  <b>⚙️ API:</b> <a href="https://search-engine-website.onrender.com/api/health">search-engine-website.onrender.com</a>
</p>

<img src="frontend-react\src\icons\demo.png" alt="My Image" width="500">


---

## ✨ Features

| Area | Details |
|------|---------|
| **Search** | Full-text (`$text` + regex fallback), pagination, `web` / `images` tabs |
| **Images** | Grid with lazy-load, filters `image` field, IMSET/MYU seeded data |
| **Auth** | Signup / login (`x-user` header), guest mode |
| **History** | Per-user `searchHistory[]` (capped 100), view / filter / delete / clear all |
| **UX** | Dark mode, `resultsPerPage`, `safeSearch`, responsive, SPA routing |
| **Resilience** | **MongoDB optional** — `GET /api/search` returns mock results when DB is down so the demo never 404s |

## 🧰 Tech Stack

**Frontend:** React 19, React Router 7, CRA 5, CSS variables (light/dark)  
**Backend:** Node 20, Express 5, MongoDB Driver 6, CORS, dotenv  
**Infra:** Netlify (frontend), Render (backend), MongoDB Atlas

## 📂 Project Structure

```
Search-Engine-website/
├── backend/
│   ├── server.js        # Express API + MongoDB + mock fallback
│   ├── seed.js          # Idempotent seed (IMSET/MYU)
│   └── package.json
├── frontend-react/
│   ├── public/
│   │   ├── index.html
│   │   └── _redirects   # SPA fallback for Netlify
│   ├── src/
│   │   ├── App.js
│   │   ├── config.js    # REACT_APP_API_URL → API_URL
│   │   └── components/  # SearchBar, ResultsList, History, Settings...
│   └── package.json
├── netlify.toml         # Build: npm install + CI=false build
└── render.yaml          # Blueprint for Render
```

## 🚀 Quick Start

**Prerequisites:** Node.js **20+**, npm, MongoDB Atlas URI (or `""` for mock mode)

```bash
git clone https://github.com/SedikDarragi/Search-Engine-website.git
cd Search-Engine-website

# 1) Backend
cp backend/.env.example backend/.env   # edit MONGODB_URI, FRONTEND_URL
cd backend && npm ci && npm start      # http://localhost:3000

# 2) Frontend (new terminal)
cd ../frontend-react
cp .env.example .env                   # leave REACT_APP_API_URL empty for proxy
npm ci && npm start                    # http://localhost:3001 → proxies to :3000
```

Open `http://localhost:3001`, search `IMSET`.

## 🔧 Environment Variables

### `backend/.env` (see `backend/.env.example`)

| Key | Example | Required |
|-----|---------|----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/searchengine` | No — search works in mock mode if empty |
| `PORT` | `3000` | No — Render injects `10000` |
| `FRONTEND_URL` | `https://searchenginewebsite.netlify.app,http://localhost:3001` | No — comma-separated CORS allowlist |
| `NODE_ENV` | `production` | No |

### `frontend-react/.env` (see `frontend-react/.env.example`)

| Key | Example |
|-----|---------|
| `REACT_APP_API_URL` | `http://localhost:3000` (local) / `https://search-engine-website.onrender.com` (prod) |

> `config.js` strips trailing `/`. If `REACT_APP_API_URL` is unset, it falls back to `http://localhost:3000`.

## 📡 API Reference

Base: `https://search-engine-website.onrender.com`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | `{"status":"ok"}` |
| `GET` | `/api/health` | — | `{"status":"healthy","database":"connected|disconnected"}` |
| `POST` | `/api/signup` | — | `{username,email,password}` |
| `POST` | `/api/login` | — | `{username,password}` → `{user:{username,email,settings}}` |
| `GET` | `/api/history` | `x-user` | List history |
| `DELETE` | `/api/history` | `x-user` | Clear all |
| `DELETE` | `/api/history/:id` | `x-user` | Delete one |
| `GET` | `/api/search?q=&type=web|images&page=1&limit=10` | `x-user` optional | `{items:{mongo:[],google:[]}, pagination}` — **mock if DB down** |

```bash
curl "https://search-engine-website.onrender.com/api/search?q=IMSET&type=web"
```

## ☁️ Deployment

### Backend → Render
1. Push to GitHub — `render.yaml` is auto-detected (Blueprint).
2. Or manual: Render → New Web Service → Root Directory: `backend`, Build: `npm ci`, Start: `npm start`, Health Check: `/api/health`.
3. Env: `MONGODB_URI`, `FRONTEND_URL=https://searchenginewebsite.netlify.app`, `NODE_ENV=production`.
4. Seed (once): `MONGODB_URI=... node backend/seed.js` (local or Render Shell).

### Frontend → Netlify
Preconfigured `netlify.toml`:
```
base = "frontend-react" | publish = "build" | command = "npm install --legacy-peer-deps && CI=false npm run build"
NODE_VERSION = "20" | redirects /* → /index.html
```
1. Netlify → Import from Git.
2. Env: `REACT_APP_API_URL=https://search-engine-website.onrender.com`.
3. Deploy → `Trigger deploy → Clear cache` after env changes.

**Local prod check:**
```bash
MONGODB_URI=... FRONTEND_URL=http://localhost:3001 node backend/server.js
curl http://localhost:3000/api/health
REACT_APP_API_URL=http://localhost:3000 npm --prefix frontend-react run build && npx serve -s frontend-react/build
```

## 📄 License

MIT — see `LICENSE`.
