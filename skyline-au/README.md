# WeatherMap

Mobile-first weather PWA: React + Vite + TypeScript, Express backend (Open‑Meteo forecasts, AU BoM warnings XML, US NWS alerts, RainViewer radar in the client). Installable PWA with offline caching for shell and API.

## Run locally

From `skyline-au/`:

```bash
cd backend && npm ci && cp .env.example .env && npm run dev   # port 8787
cd frontend && npm ci && npm run dev    # port 5173, proxies /api → 8787
```

Set `PROVIDER=live` (default in Docker) for real data. Use `PROVIDER=mock` only for offline UI tests.

## Deploy (Docker / Railway)

1. Repo root for the container is this directory (`skyline-au/`): `Dockerfile` builds backend + frontend static.
2. Railway: set **Root Directory** to `skyline-au` if the Git monorepo root is above this folder.
3. Health check: `GET /api/health`
4. Optional env: `PORT`, `PROVIDER`, `NOMINATIM_USER_AGENT`, `NWS_USER_AGENT`, BOM contact in code or custom proxy.

## Data sources

- Forecast & geocoding: Open‑Meteo  
- AU warnings: Bureau of Meteorology product XML (`fwo/IDZ…`)  
- US alerts: api.weather.gov  
- Radar mosaic (browser): RainViewer public API  

Not affiliated with third-party weather brands.
