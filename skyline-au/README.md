# WeatherMap

Mobile-first weather PWA: React + Vite + TypeScript, Express backend (Open‑Meteo forecasts, AU BoM warnings XML, US NWS alerts, AU radar images proxied from BoM anonymous FTP). Installable PWA with offline caching for shell and API.

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
- Radar: **Australia** — BoM `anon/gen/radar` PNG timesteps (`IDR*.T.*`) via backend `GET /api/radar/bom/frames` and `GET /api/radar/bom/png/:file`; map has **no third‑party basemap** (grid backdrop only). Other countries: placeholder until additional official feeds are integrated.

## Android APK (Capacitor)

The packaged app loads the **live** PWA from Railway (default URL in `frontend/capacitor.config.ts`). A recent **debug** build is in `/releases/WeatherMap-debug.apk` at repo root for sideloading.

**Build yourself** (macOS example):

1. Install **JDK 17** and Android **command-line tools**; set `ANDROID_HOME` to the SDK root (e.g. Homebrew: `/opt/homebrew/share/android-commandlinetools`) and accept licenses: `sdkmanager --licenses`.
2. Optional: `export WEATHERMAP_SERVER_URL=https://your-host.up.railway.app` before sync.
3. From `frontend/`: `npm ci && npm run android:build`  
   (uses `JAVA_HOME` for Java 17; e.g. `export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`).

**Icons:** Launcher and splash images are generated from the same **`public/icon-512.png`** as the PWA (`npm run android:icons`, requires **Python 3 + Pillow**: `pip3 install Pillow`).
Debug APK path after build: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

**Install on device:** enable installing apps from unknown sources (or use ADB `adb install`), open the APK, install. Debug builds are for testing only; for Play Store use a signed release (`./gradlew assembleRelease` with your keystore).

**Operators:** The radar map omits basemap tiles (no OSM/Carto/RainViewer). AU layers use BoM anonymous FTP products; check current **[copyright and use terms](https://www.bom.gov.au/other/copyright)** for redistribution and commercial vs non‑commercial use. Hiding attribution in the UI does not replace compliance with data licences.

Not affiliated with third-party weather brands.
