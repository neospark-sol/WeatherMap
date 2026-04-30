import express from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { WarningQuery } from './types.js';
import { buildProvider } from './providers/index.js';
import {
  boundsForSite,
  fetchBomRadarPng,
  listBomRadarFrames,
  radarSiteForAuState
} from './providers/bomRadarFtp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const provider = buildProvider();
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const TTL = {
  current: Number(process.env.CACHE_TTL_CURRENT ?? 600),
  hourly: Number(process.env.CACHE_TTL_HOURLY ?? 900),
  daily: Number(process.env.CACHE_TTL_DAILY ?? 1800),
  warnings: Number(process.env.CACHE_TTL_WARNINGS ?? 300)
};

async function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get<T>(key);
  if (hit !== undefined) return hit;
  const fresh = await fn();
  cache.set(key, fresh, ttl);
  return fresh;
}

function asNum(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error('invalid coord');
  return n;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, provider: process.env.PROVIDER ?? 'live' }));

app.get('/api/location/search', async (req, res) => {
  try {
    const q = String(req.query.q ?? '');
    const country = req.query.country ? String(req.query.country) : undefined;
    const cacheKey = `search:${q}:${country ?? 'all'}`;
    const data = await cached(cacheKey, 600, () => provider.searchLocations(q, country));
    res.json({ results: data });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get('/api/location/reverse', async (req, res) => {
  try {
    const lat = asNum(req.query.lat),
      lon = asNum(req.query.lon);
    const cacheKey = `rev:${lat.toFixed(4)},${lon.toFixed(4)}`;
    const data = await cached(cacheKey, 86400, async () => {
      const { nominatimReverse } = await import('./providers/nominatim.js');
      return nominatimReverse(lat, lon);
    });
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.get('/api/weather/current', async (req, res) => {
  try {
    const lat = asNum(req.query.lat),
      lon = asNum(req.query.lon);
    const tz = req.query.tz ? String(req.query.tz) : undefined;
    const data = await cached(`cur:${lat},${lon}`, TTL.current, () => provider.getCurrent(lat, lon, tz));
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.get('/api/weather/hourly', async (req, res) => {
  try {
    const lat = asNum(req.query.lat),
      lon = asNum(req.query.lon);
    const tz = req.query.tz ? String(req.query.tz) : undefined;
    const data = await cached(`h:${lat},${lon}`, TTL.hourly, () => provider.getHourly(lat, lon, tz));
    res.json({ points: data });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.get('/api/weather/daily', async (req, res) => {
  try {
    const lat = asNum(req.query.lat),
      lon = asNum(req.query.lon);
    const tz = req.query.tz ? String(req.query.tz) : undefined;
    const data = await cached(`d:${lat},${lon}`, TTL.daily, () => provider.getDaily(lat, lon, tz));
    res.json({ days: data });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.get('/api/warnings', async (req, res) => {
  try {
    const country = String(req.query.country ?? 'AU').toUpperCase();
    const state = req.query.state != null ? String(req.query.state) : '';
    const lat = req.query.lat != null && String(req.query.lat) !== '' ? Number(req.query.lat) : undefined;
    const lon = req.query.lon != null && String(req.query.lon) !== '' ? Number(req.query.lon) : undefined;
    const cacheKey = `w:${country}:${state}:${lat ?? ''}:${lon ?? ''}`;
    const query: WarningQuery = { country, state, lat, lon };
    const data = await cached(cacheKey, TTL.warnings, () => provider.getWarnings(query));
    res.json({ warnings: data });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/** BoM anonymous FTP radar (AU). Proxied so browsers do not need ftp://. */
app.get('/api/radar/bom/frames', async (req, res) => {
  try {
    let site = String(req.query.site ?? '').toUpperCase();
    if (!site && req.query.state != null) {
      site = radarSiteForAuState(String(req.query.state));
    }
    if (!site) site = 'IDR714';
    if (!/^IDR\d{3}$/.test(site)) {
      res.status(400).json({ error: 'invalid site' });
      return;
    }
    const limRaw = Number(req.query.limit);
    const limit = Number.isFinite(limRaw) ? Math.min(48, Math.max(4, Math.floor(limRaw))) : 24;
    const cacheKey = `bomrf:${site}:${limit}`;
    const frames = await cached(cacheKey, 45, () => listBomRadarFrames(site, limit));
    const bounds = boundsForSite(site);
    res.json({ site, bounds, frames });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get('/api/radar/bom/png/:file', async (req, res) => {
  try {
    const file = String(req.params.file);
    const cacheKey = `bomp:${file}`;
    const buf = await cached(cacheKey, 40, () => fetchBomRadarPng(file));
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=40');
    res.send(buf);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

const staticDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () =>
  console.log(`[weathermap] http://localhost:${port} provider=${process.env.PROVIDER ?? 'live'} static=${fs.existsSync(staticDir)}`)
);
