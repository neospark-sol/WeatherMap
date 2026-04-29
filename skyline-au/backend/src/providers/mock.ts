import type { WeatherProvider, Location, CurrentConditions, HourPoint, DailyPoint, WarningItem, WarningQuery } from '../types.js';

const CITIES: (Location & { base: number; cond: string; icon: string; high: number; low: number })[] = [
  {
    id: 'syd',
    name: 'Sydney',
    state: 'NSW',
    country: 'AU',
    lat: -33.8688,
    lon: 151.2093,
    timezone: 'Australia/Sydney',
    base: 24,
    cond: 'Mostly sunny',
    icon: '☀️',
    high: 27,
    low: 17
  },
  {
    id: 'mel',
    name: 'Melbourne',
    state: 'VIC',
    country: 'AU',
    lat: -37.8136,
    lon: 144.9631,
    timezone: 'Australia/Melbourne',
    base: 18,
    cond: 'Showers easing',
    icon: '🌧️',
    high: 20,
    low: 12
  },
  {
    id: 'bne',
    name: 'Brisbane',
    state: 'QLD',
    country: 'AU',
    lat: -27.4698,
    lon: 153.0251,
    timezone: 'Australia/Brisbane',
    base: 28,
    cond: 'Storms developing',
    icon: '⛈️',
    high: 31,
    low: 21
  },
  {
    id: 'per',
    name: 'Perth',
    state: 'WA',
    country: 'AU',
    lat: -31.9523,
    lon: 115.8613,
    timezone: 'Australia/Perth',
    base: 26,
    cond: 'Sunny & clear',
    icon: '☀️',
    high: 30,
    low: 16
  },
  {
    id: 'adl',
    name: 'Adelaide',
    state: 'SA',
    country: 'AU',
    lat: -34.9285,
    lon: 138.6007,
    timezone: 'Australia/Adelaide',
    base: 22,
    cond: 'Partly cloudy',
    icon: '⛅',
    high: 25,
    low: 14
  },
  {
    id: 'hba',
    name: 'Hobart',
    state: 'TAS',
    country: 'AU',
    lat: -42.8821,
    lon: 147.3272,
    timezone: 'Australia/Hobart',
    base: 14,
    cond: 'Cool and breezy',
    icon: '☁️',
    high: 16,
    low: 8
  },
  {
    id: 'dwn',
    name: 'Darwin',
    state: 'NT',
    country: 'AU',
    lat: -12.4634,
    lon: 130.8456,
    timezone: 'Australia/Darwin',
    base: 32,
    cond: 'Hot and humid',
    icon: '⛅',
    high: 34,
    low: 25
  },
  {
    id: 'cbr',
    name: 'Canberra',
    state: 'ACT',
    country: 'AU',
    lat: -35.2809,
    lon: 149.13,
    timezone: 'Australia/Canberra',
    base: 19,
    cond: 'Clear',
    icon: '☀️',
    high: 23,
    low: 9
  },
  {
    id: 'ca-yyz',
    name: 'Toronto',
    state: 'Ontario',
    country: 'CA',
    lat: 43.6532,
    lon: -79.3832,
    timezone: 'America/Toronto',
    base: 12,
    cond: 'Partly cloudy',
    icon: '⛅',
    high: 15,
    low: 6
  },
  {
    id: 'ca-van',
    name: 'Vancouver',
    state: 'British Columbia',
    country: 'CA',
    lat: 49.2827,
    lon: -123.1207,
    timezone: 'America/Vancouver',
    base: 11,
    cond: 'Rain showers',
    icon: '🌧️',
    high: 14,
    low: 7
  },
  {
    id: 'us-hou',
    name: 'Houston',
    state: 'Texas',
    country: 'US',
    lat: 29.7604,
    lon: -95.3698,
    timezone: 'America/Chicago',
    base: 26,
    cond: 'Humid & warm',
    icon: '⛅',
    high: 32,
    low: 22
  },
  {
    id: 'us-mia',
    name: 'Miami',
    state: 'Florida',
    country: 'US',
    lat: 25.7617,
    lon: -80.1918,
    timezone: 'America/New_York',
    base: 28,
    cond: 'Scattered storms',
    icon: '⛈️',
    high: 31,
    low: 24
  },
  {
    id: 'pk-khi',
    name: 'Karachi',
    state: 'Sindh',
    country: 'PK',
    lat: 24.8607,
    lon: 67.0011,
    timezone: 'Asia/Karachi',
    base: 32,
    cond: 'Hot',
    icon: '☀️',
    high: 35,
    low: 26
  },
  {
    id: 'in-bom',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'IN',
    lat: 19.076,
    lon: 72.8777,
    timezone: 'Asia/Kolkata',
    base: 30,
    cond: 'Haze',
    icon: '🌫️',
    high: 33,
    low: 25
  },
  {
    id: 'in-del',
    name: 'New Delhi',
    state: 'Delhi',
    country: 'IN',
    lat: 28.6139,
    lon: 77.209,
    timezone: 'Asia/Kolkata',
    base: 28,
    cond: 'Mostly sunny',
    icon: '☀️',
    high: 34,
    low: 18
  },
  {
    id: 'sg-sin',
    name: 'Singapore',
    state: 'Singapore',
    country: 'SG',
    lat: 1.3521,
    lon: 103.8198,
    timezone: 'Asia/Singapore',
    base: 28,
    cond: 'Thunderstorms possible',
    icon: '⛈️',
    high: 31,
    low: 25
  }
];

function pickByCoords(lat: number, lon: number) {
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export const mockProvider: WeatherProvider = {
  async searchLocations(q: string, countryCode?: string) {
    const s = q.toLowerCase().trim();
    const cc = countryCode?.trim().toUpperCase();
    let pool = CITIES;
    if (cc && cc !== 'ALL' && cc !== '*') pool = CITIES.filter((c) => c.country === cc);
    if (!s) return pool.slice(0, 12);
    return pool.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.state.toLowerCase().includes(s) ||
        c.country.toLowerCase().includes(s)
    );
  },

  async getCurrent(lat, lon) {
    const c = pickByCoords(lat, lon);
    return {
      observedAt: new Date().toISOString(),
      temperatureC: c.base,
      feelsLikeC: c.base + (c.cond.includes('humid') ? 3 : -1),
      humidityPct: 55 + Math.round(Math.random() * 25),
      windKph: 12 + Math.round(Math.random() * 14),
      windGustKph: 25 + Math.round(Math.random() * 15),
      windDir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      pressureHpa: 1010 + Math.round(Math.random() * 10),
      uvIndex: 6 + Math.round(Math.random() * 4),
      conditionCode: c.cond.toLowerCase().replace(/\s+/g, '-'),
      conditionLabel: c.cond,
      icon: c.icon
    };
  },

  async getHourly(lat, lon) {
    const c = pickByCoords(lat, lon);
    const out: HourPoint[] = [];
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const rainBias = c.cond.includes('Storm') ? 0.7 : c.cond.includes('Show') ? 0.55 : c.cond.includes('cloud') ? 0.2 : 0.08;
    for (let i = 0; i < 48; i++) {
      const t = new Date(now.getTime() + i * 3600_000);
      const hr = t.getHours();
      const diurnal = Math.sin(((hr - 6) / 24) * Math.PI * 2) * 5;
      const tempC = Math.round((c.base + diurnal + (Math.random() - 0.5) * 1.2) * 10) / 10;
      const rainP = Math.min(
        95,
        Math.max(0, Math.round(40 * rainBias + Math.sin(i / 4) * 22 + (Math.random() - 0.5) * 15))
      );
      const precipMm =
        rainP > 50
          ? Math.round(Math.random() * rainBias * 4 * 10) / 10
          : rainP > 25
            ? Math.round(Math.random() * 0.6 * 10) / 10
            : 0;
      const windKph = Math.round(15 + Math.sin(i / 6) * 6 + (Math.random() - 0.5) * 4);
      out.push({
        time: t.toISOString(),
        tempC,
        rainProbabilityPct: rainP,
        precipMm,
        windKph,
        windGustKph: windKph + 6 + Math.round(Math.random() * 8),
        humidityPct: 60 + Math.round((Math.random() - 0.5) * 20),
        conditionCode: rainP > 70 ? 'storm' : rainP > 40 ? 'rain' : rainP > 20 ? 'partly' : 'clear'
      });
    }
    return out;
  },

  async getDaily(lat, lon) {
    const c = pickByCoords(lat, lon);
    const out: DailyPoint[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 86400_000);
      const trend = Math.sin(i / 2) * 3;
      const max = Math.round(c.high + trend + (Math.random() - 0.5) * 2);
      const min = Math.round(c.low + trend * 0.6 + (Math.random() - 0.5) * 2);
      const rainP = Math.max(0, Math.min(95, Math.round(20 + (Math.random() - 0.4) * 60)));
      let icon = '☀️',
        label = 'Sunny',
        code = 'clear';
      if (rainP > 70) {
        icon = '⛈️';
        label = 'Storms';
        code = 'storm';
      } else if (rainP > 45) {
        icon = '🌧️';
        label = 'Showers';
        code = 'rain';
      } else if (rainP > 25) {
        icon = '🌦️';
        label = 'Few showers';
        code = 'showers';
      } else if (rainP > 10) {
        icon = '⛅';
        label = 'Partly cloudy';
        code = 'partly';
      }
      out.push({
        date: d.toISOString().slice(0, 10),
        minC: min,
        maxC: max,
        rainProbabilityPct: rainP,
        precipMm: rainP > 50 ? Math.round(Math.random() * 8 * 10) / 10 : 0,
        windKph: 10 + Math.round(Math.random() * 15),
        conditionCode: code,
        conditionLabel: label,
        icon
      });
    }
    return out;
  },

  async getWarnings(query: WarningQuery): Promise<WarningItem[]> {
    if (query.country.toUpperCase() !== 'AU') return [];
    const s = (query.state ?? 'NSW').toUpperCase();
    const all: Record<string, WarningItem[]> = {
      NSW: [
        {
          id: 'w1',
          severity: 'moderate',
          title: 'Severe Thunderstorm Warning',
          summary:
            'Damaging winds and large hail possible from late afternoon across the Sydney metropolitan area.',
          issuedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
          expiresAt: new Date(Date.now() + 6 * 3600_000).toISOString(),
          areas: ['Sydney Metropolitan', 'Illawarra'],
          source: 'Bureau of Meteorology'
        },
        {
          id: 'w2',
          severity: 'minor',
          title: 'Marine Wind Warning',
          summary: 'Strong wind warning for Sydney coastal waters. Winds 25 to 33 knots offshore.',
          issuedAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
          expiresAt: new Date(Date.now() + 18 * 3600_000).toISOString(),
          areas: ['Sydney Coast', 'Hunter Coast'],
          source: 'Bureau of Meteorology'
        }
      ],
      VIC: [
        {
          id: 'w3',
          severity: 'minor',
          title: 'Sheep Grazier Alert',
          summary: 'Cold, wet and windy conditions expected. Risk to lambs and off-shears sheep across central Victoria.',
          issuedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
          expiresAt: null,
          areas: ['Central', 'North Central', 'Wimmera'],
          source: 'Bureau of Meteorology'
        }
      ],
      QLD: [
        {
          id: 'w4',
          severity: 'severe',
          title: 'Severe Weather Warning',
          summary: 'Heavy rainfall that may lead to flash flooding in southeast Queensland through tonight and tomorrow.',
          issuedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
          areas: ['Southeast Coast', 'Wide Bay & Burnett'],
          source: 'Bureau of Meteorology'
        }
      ],
      ACT: [
        {
          id: 'w-act-1',
          severity: 'minor',
          title: 'Frost Warning',
          summary: 'Frost likely in parts of the ACT and surrounding ranges early Thursday morning.',
          issuedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
          expiresAt: new Date(Date.now() + 12 * 3600_000).toISOString(),
          areas: ['Canberra', 'Brindabella Ranges'],
          source: 'Bureau of Meteorology'
        }
      ]
    };
    return all[s] ?? [];
  }
};
