# Skyline AU — Weather PWA

Mobile-first Australian weather app: React + Vite + TypeScript PWA, Express backend adapter (Open-Meteo + BOM warnings, with mock fallback). UI matches the Skyline prototype: hero, stats, hourly strip, Chart.js tabs, 7-day rows, warnings, saved locations, install banner, PWA shell. The app always loads **live** forecast and warning data from your backend when `PROVIDER=live`.

## Local development

```bash
cd backend && cp .env.example .env && npm install && npm run dev
# other terminal:
cd frontend && npm install && npm run dev
```

Open http://localhost:5173 (Vite proxies `/api` to :8787).

## Production (single process)

Build frontend and backend from the repo root `skyline-au/`:

```bash
cd backend && npm ci && npm run build
cd ../frontend && npm ci && npm run build
cd .. && PORT=8080 node backend/dist/server.js
```

Serves the SPA from `frontend/dist` and APIs under `/api/*`.

## Railway

1. Install CLI and log in: https://docs.railway.com/develop/cli
2. From `skyline-au/`: `railway link` (create or select a project).
3. Deploy: `railway up` **or** connect the GitHub repo and set **Dockerfile** build.

Recommended variables:

| Variable | Example | Notes |
|----------|---------|--------|
| `PORT` | (Railway default) | Server listens on `$PORT` |
| `PROVIDER` | `live` | Use `mock` if you want zero external calls |
| `CACHE_TTL_*` | see `.env.example` | Optional |

Health check: `GET /api/health`

Update the BOM `User-Agent` in `backend/src/providers/bom.ts` with your contact details before high-volume use.

## Regenerating PWA icons (optional)

```bash
cd frontend && npx --yes pwa-asset-generator public/favicon.svg public --background "#0b1020" --icon-only
cp public/manifest-icon-192.png public/icon-192.png
cp public/manifest-icon-512.png public/icon-512.png
```

## Licence

Data: Open-Meteo (forecast), Bureau of Meteorology (public warnings). Not affiliated with Weatherzone.
