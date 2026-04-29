# Weatherzone-Style Mobile PWA Cursor Implementation Pack

## Purpose

This document provides a staged Cursor-ready implementation pack for building a mobile-first Australian weather PWA inspired by the best parts of Weatherzone's consumer experience while using original and official data sources for the MVP.[cite:9][cite:17][cite:18]

The delivery methodology follows an HTML-first prototype stage using synthetic demo data, followed by production PWA implementation, backend adapter development, and live provider integration.[cite:79]

## Product brief for Cursor

Use the following master brief in Cursor as the starting instruction.

```text
Build a mobile-first Australian weather PWA inspired by the usability of Weatherzone, but not a clone and not dependent on Weatherzone APIs.

Methodology requirements:
- Stage 1 must be a fully interactive single HTML file with all CSS and JS inline.
- Use synthetic realistic demo weather data for Australian cities.
- The prototype must be polished, believable, and app-like, not a wireframe.
- Then continue into a production-ready implementation plan and codebase.
- Prefer original or official data sources where relevant.
- Use BOM for official warnings and Open-Meteo for forecast data in MVP.
- Build only the core scope: current conditions, hourly forecast charts, 7-day forecast, warnings, saved locations, installable PWA shell.
- Include loading, empty, success, and error states.

Product style:
- premium, calm, mobile-first, high readability
- beautiful hourly charts for rain, wind, temperature
- smooth interactions, dark and light mode
- not cluttered, not enterprise dashboard

Technical direction:
- React + Vite + TypeScript for production app
- Chart.js for charts
- PWA installable
- backend weather adapter with unified schema
- Android packaging later via Capacitor

Deliverables:
1. Stage 1 single-file interactive HTML prototype
2. Functional specification
3. Technical architecture
4. Production app scaffolding
5. Backend adapter plan
6. API integration layer
7. Cursor staged prompts for implementation
```

## API recommendations for Cursor

The MVP should use BOM as the official Australian warning-oriented source and Open-Meteo as the forecast source, because BOM provides official public weather data services while Open-Meteo provides a cleaner JSON forecast interface and documented support for BOM ACCESS-G model data in Australia.[cite:17][cite:18][cite:65]

Later paid upgrades can include Open-Meteo commercial, OpenWeather, or Tomorrow.io if higher rate limits, commercial guarantees, or richer data products are required.[cite:64][cite:66][cite:68][cite:70][cite:76]

### MVP source mapping

| Product need | MVP source | Later paid option | Notes |
|---|---|---|---|
| Hourly and daily forecast | Open-Meteo [cite:18][cite:65] | Open-Meteo commercial [cite:64][cite:66], OpenWeather [cite:68], Tomorrow.io [cite:70] | Best initial developer experience. [cite:18][cite:65] |
| Official warnings | BOM [cite:17][cite:93] | Keep BOM as official source [cite:17] | Maintains Australian trust and source clarity. [cite:17][cite:93] |
| Current conditions | BOM where practical [cite:17][cite:60] | OpenWeather [cite:68], Tomorrow.io [cite:70] | Normalize through backend. [cite:17] |
| Place search | Open-Meteo geocoding [cite:64][cite:65] | Google Places later if needed | MVP can stay lean. [cite:64] |
| Radar | BOM/public adapter if practical [cite:17] | DTN or enterprise weather data [cite:57][cite:62] | Treat as optional in MVP. [cite:17] |

## Delivery stages

### Stage 1: Interactive single-file prototype

The first build artifact must be a single standalone HTML file with all CSS and JavaScript inline, in line with the methodology from the app request template.[cite:79]

#### Stage 1 requirements

- Mobile-first polished weather UI.[cite:79]
- Synthetic realistic data for Sydney, Melbourne, Brisbane, Perth, and Adelaide.[cite:79]
- Current conditions card.[cite:18]
- Hourly strip and chart tabs for temperature, rain, and wind.[cite:80][cite:81]
- Seven-day forecast.[cite:18]
- Warnings banner and warning-state screen.[cite:17][cite:93]
- Saved locations modal or screen.[cite:79]
- Light and dark mode.[cite:85]
- Loading, empty, success, and network error states.[cite:79][cite:85]
- Fake install prompt or install banner.[cite:85]

#### Stage 1 prompt

```text
Create Stage 1 as a single self-contained HTML file for a mobile weather PWA.

Requirements:
- One HTML file only
- All CSS and JS inline
- No external backend
- Use synthetic realistic data for Sydney, Melbourne, Brisbane, Perth, Adelaide
- Include:
  - home screen
  - current weather card
  - hourly forecast strip
  - chart tabs for temperature, rain, wind
  - 7-day forecast
  - warnings panel
  - saved locations modal
  - loading/empty/error states
- Mobile-first premium design
- Dark and light mode
- Chart area can use canvas and embedded JS
- Beautiful weather visuals, but restrained
- Make interactions feel real
- Include a fake install banner
- Include fake pull-to-refresh feel if practical

Output:
- single downloadable HTML file
- then explain component structure and synthetic data model
```

### Stage 2: Production PWA scaffold

After the prototype is approved, convert the app into a proper React, Vite, and TypeScript PWA shell with reusable components, route structure, and a local mock-data provider.[cite:85]

#### Stage 2 prompt

```text
Convert the Stage 1 prototype into a production React + Vite + TypeScript PWA.

Requirements:
- route structure for Home, Forecast, Warnings, Saved Locations, Settings
- reusable components
- weather domain types
- local mock data provider first
- service layer abstraction for weather providers
- IndexedDB persistence for favourites and last-viewed location
- dark mode support
- responsive mobile-first layout
- prepare for Chart.js integration
```

### Stage 3: Backend weather adapter

Build a thin backend service that consumes upstream weather providers and emits one normalized contract for the frontend.[cite:17][cite:18][cite:64]

#### Stage 3 prompt

```text
Create a backend adapter service for the weather app.

Requirements:
- Node.js + TypeScript
- unified internal weather schema
- provider adapters:
  - Open-Meteo forecast adapter
  - BOM warnings adapter
  - optional BOM observations adapter
- routes:
  - GET /api/location/search
  - GET /api/weather/current
  - GET /api/weather/hourly
  - GET /api/weather/daily
  - GET /api/warnings
- implement response caching
- normalize timestamps to ISO strings with timezone support
- graceful fallback if one provider fails
- return a stable JSON contract for frontend use
```

### Stage 4: Premium hourly charts

The chart experience is one of the core product differentiators, so it should be built as a first-class weather-visualization module rather than a basic dashboard widget.[cite:80][cite:81]

#### Stage 4 prompt

```text
Implement premium hourly weather charts using Chart.js.

Requirements:
- line chart for temperature
- bar or area chart for rain / precipitation
- line chart for wind speed
- optional dashed overlay for wind gusts
- use time or timeseries x-axis
- mobile-friendly touch interactions
- synchronized selected-hour state between chart and hourly cards
- support 12h / 24h / 48h ranges
- dark and light themes
- smooth transitions
- avoid clutter and heavy grid lines
```

### Stage 5: PWA hardening

Once live data works end to end, harden the install, cache, retry, and offline experience.[cite:85][cite:88]

#### Stage 5 prompt

```text
Implement PWA hardening for the weather app.

Requirements:
- manifest
- service worker registration in app code
- cache shell assets
- stale-while-revalidate for weather responses where appropriate
- offline fallback for last successful forecast
- install prompt handling
- retry and timeout UX
- Android-friendly behavior for later Capacitor wrapping
```

## Unified data contract for Cursor

Cursor should build the app around a provider-agnostic internal schema so the UI remains stable if APIs change later.[cite:17][cite:18][cite:64]

### Suggested TypeScript domain models

```ts
export type Location = {
  id: string;
  name: string;
  state: string;
  country: 'AU';
  postcode?: string;
  lat: number;
  lon: number;
  timezone: string;
};

export type CurrentConditions = {
  observedAt: string;
  temperatureC: number;
  feelsLikeC?: number;
  humidityPct?: number;
  windKph?: number;
  windGustKph?: number;
  windDir?: string;
  pressureHpa?: number;
  uvIndex?: number;
  conditionCode: string;
  conditionLabel: string;
};

export type HourPoint = {
  time: string;
  tempC: number;
  rainProbabilityPct?: number;
  precipMm?: number;
  windKph?: number;
  windGustKph?: number;
  humidityPct?: number;
};

export type DailyPoint = {
  date: string;
  minC: number;
  maxC: number;
  rainProbabilityPct?: number;
  precipMm?: number;
  windKph?: number;
  conditionCode: string;
  conditionLabel?: string;
};

export type WarningItem = {
  id: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  summary: string;
  issuedAt: string;
  expiresAt?: string | null;
  areas: string[];
  source: string;
  url?: string;
};
```

## App structure guidance for Cursor

Recommended frontend module structure:

- `app/` for app shell and providers
- `features/weather/` for current, hourly, and daily forecast modules
- `features/warnings/` for warnings list and detail
- `features/locations/` for search and favourites
- `components/charts/` for reusable chart primitives
- `services/api/` for backend client calls
- `services/storage/` for IndexedDB persistence
- `mocks/` for synthetic data and development fixtures

This structure keeps weather-domain logic organized while still allowing the Stage 1 prototype patterns to map cleanly into production code.[cite:79]

## API consumption rules for Cursor

The frontend should never call Open-Meteo, BOM, OpenWeather, or Tomorrow.io directly in production mode.[cite:17][cite:64]

Instead, all live requests should go through the backend adapter so keys, rate limits, caching rules, and provider-specific quirks stay server-side.[cite:64][cite:68][cite:70]

## Suggested caching policy for implementation

Use these initial cache targets server-side:[cite:64][cite:17]

- Current conditions: 10 minutes.[cite:64]
- Hourly forecast: 15 minutes.[cite:64]
- Daily forecast: 30 to 60 minutes.[cite:64]
- Warnings: 5 minutes.[cite:17][cite:93]

## Nice-to-have later stages

After the MVP is stable, the roadmap can add optional radar views, richer overlays, sunrise and sunset, precipitation animation, push alerts, air quality, and shareable forecast cards.[cite:17][cite:70][cite:76]

These should remain explicitly outside the initial core delivery pack so Cursor stays focused on shipping the highest-value app experience first.[cite:79]
