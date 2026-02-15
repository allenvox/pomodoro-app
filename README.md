# Pomodoro App

A small web app for the [Pomodoro technique](https://en.wikipedia.org/wiki/Pomodoro_Technique): work/break timer, sign-in with email, session tracking, and a simple leaderboard.

You can try it out on [my website](http://play.grigoryev.org:8080/)!

## What you need

- **Node.js** 18 or newer  
- **npm**  
- **MongoDB** (on your machine or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))  
- A **Firebase** project with Email/Password auth enabled  

## Get started

### 1. Clone and install

```bash
cd pomodoro-app
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Secrets and config go in `.env` files. **Do not commit `.env`** — use the examples as a template.

**Backend**

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` if needed:

- `PORT` — default is 3000  
- `MONGODB_URI` — e.g. `mongodb://localhost:27017/pomodoro` or your Atlas URL  

**Frontend**

```bash
cp frontend/env.example frontend/.env
```

Edit `frontend/.env` and set:

- `VITE_API_URL` — your API URL (e.g. `http://localhost:3000`). Leave empty for Docker (same origin).  
- All `VITE_FIREBASE_*` — from [Firebase Console](https://console.firebase.google.com/) → your project → **Project settings** → **Your apps** → copy the config into the variables listed in `env.example`.  

The app will not start without at least `VITE_FIREBASE_API_KEY` set.

### 3. Run MongoDB

- **Local:** start MongoDB (e.g. `mongod` or your OS service).  
- **Atlas:** create a cluster, get the connection string, put it in `backend/.env` as `MONGODB_URI`, and allow your IP in the network settings.  

### 4. Run the app

**Terminal 1 — backend**

```bash
cd backend
npm start
```

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

## Run with Docker

From the project root:

```bash
docker compose up -d --build
```

- App: **http://localhost:8080**  
- MongoDB data is stored in a Docker volume.  
- To use Firebase auth, set the `VITE_FIREBASE_*` variables when building (e.g. have `frontend/.env` with those vars before running the command; the compose file passes them as build args).  

Stop everything:

```bash
docker compose down
```

## Project layout

| Part      | Role |
|----------|------|
| `backend/`  | Node + Express API; MongoDB (users, sessions, leaderboard). |
| `frontend/` | React + Vite app; Firebase Auth; talks to backend API. |

Main pieces:

- `backend/server.ts` — Express app and route mounting  
- `backend/models/` — User, Session (Mongoose)  
- `backend/routes/` — users, sessions, leaderboard  
- `frontend/src/` — React app, Firebase config (from env), API client, Timer/Login/Leaderboard  

Favicon: replace `frontend/public/favicon.svg` and the `<link rel="icon">` in `frontend/index.html` if you want a different one.

## API (backend)

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/users` | Create user (firebaseUid, username). Idempotent. |
| POST   | `/api/users/:userId/friends` | Add friend (send `friendId` in body). |
| GET    | `/api/leaderboard?period=all\|week\|month` | Leaderboard for chosen period. |
| POST   | `/api/sessions` | Save a session (userId, duration in seconds). |

## Features

- Email/password sign-in (Firebase)  
- Configurable work and break duration; timer state survives navigation  
- Sessions sent to backend; leaderboard with period filter and “current user” highlight  
- Sound and toast when a work or break block ends  
- All config via `.env`; runnable with Docker  

## Production

- **Backend:** `cd backend && npx tsc && node dist/server.js` (or use PM2).  
- **Frontend:** `cd frontend && npm run build`; deploy the `dist/` folder to any static host (Vercel, Netlify, etc.).  
- Set `VITE_API_URL` to your production API URL when building the frontend.  

## Troubleshooting

| Problem | What to check |
|--------|----------------|
| Blank screen / “Missing Firebase config” | Create `frontend/.env` from `frontend/env.example` and set all `VITE_FIREBASE_*` from Firebase Console. |
| Backend can’t connect to DB | MongoDB running? Correct `MONGODB_URI` in `backend/.env`? For Atlas: IP allowlist. |
| Port already in use | Change `PORT` in `backend/.env` or the process using the port. |
| CORS errors | Backend allows all origins by default; restrict in production if needed. |
