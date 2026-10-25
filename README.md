# Tutor Portal (MERN) — Vercel ready

## Local run
1. `cp server/.env.example server/.env` and fill MONGODB_URI + JWT_SECRET_KEY
2. `npm install && npm start`            (API on http://localhost:5000)
3. `cd client && npm install && npm run dev`   (site on http://localhost:5173)

## Deploy on Vercel
Push to GitHub → Import the repo in Vercel → add env vars MONGODB_URI and JWT_SECRET_KEY → Deploy.
(vercel.json already contains the build settings.)
