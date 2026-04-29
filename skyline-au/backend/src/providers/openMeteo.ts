import { request } from 'undici';
import type { WeatherProvider, Location, CurrentConditions, HourPoint, DailyPoint } from '../types.js';
import { wmoToCondition, degToCompass } from '../util/wmo.js';

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';

/** Commercial / higher-limit plans: set OPENMETEO_KEY in .env (see https://open-meteo.com/en/pricing). */
function withOptionalApiKey(params: URLSearchParams): URLSearchParams {
  const key = process.env.OPENMETEO_KEY?.trim();
  if (key) params.set('apikey', key);
  return params;
}

async function getJson<T>(url: string): Promise<T> {
  const { body, statusCode } = await request(url, { headersTimeout: 10000, bodyTimeout: 10000 });
  if (statusCode >= 400) throw new Error(`Upstream ${statusCode}: ${url}`);
  return (await body.json()) as T;
}

export const openMeteoProvider: Pick<WeatherProvider, 'searchLocations' | 'getCurrent' | 'getHourly' | 'getDaily'> = {
  async searchLocations(q: string, countryCode?: string): Promise<Location[]> {
    if (!q.trim()) return [];
    const params = new URLSearchParams({
      name: q.trim(),
      count: '12',
      language: 'en',
      format: 'json'
    });
    const cc = countryCode?.trim().toUpperCase();
    if (cc && cc !== 'ALL' && cc !== '*') params.set('countryCode', cc);
    withOptionalApiKey(params);
    const url = `${GEOCODE}?${params}`;
    const data = await getJson<{ results?: { id: number; name: string; admin1?: string; country_code?: string; postcodes?: string[]; latitude: number; longitude: number; timezone?: string }[] }>(url);
    return (data.results ?? []).map((r) => {
      const country = (r.country_code ?? '').toUpperCase() || 'XX';
      return {
        id: `${country.toLowerCase()}-${r.id}`,
        name: r.name,
        state: r.admin1 ?? '',
        country,
        postcode: r.postcodes?.[0],
        lat: r.latitude,
        lon: r.longitude,
        timezone: r.timezone ?? 'auto'
      };
    });
  },

  async getCurrent(lat, lon, tz = 'auto'): Promise<CurrentConditions> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone: tz,
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,weather_code,is_day',
      daily: 'uv_index_max',
      wind_speed_unit: 'kmh',
      temperature_unit: 'celsius'
    });
    withOptionalApiKey(params);
    const data = await getJson<{
      current: {
        time: string;
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        wind_gusts_10m: number;
        wind_direction_10m: number;
        surface_pressure: number;
        weather_code: number;
        is_day: number;
      };
      daily?: { uv_index_max?: number[] };
    }>(`${FORECAST}?${params}`);
    const c = data.current;
    const cond = wmoToCondition(c.weather_code, c.is_day === 1);
    return {
      observedAt: new Date(c.time).toISOString(),
      temperatureC: c.temperature_2m,
      feelsLikeC: c.apparent_temperature,
      humidityPct: c.relative_humidity_2m,
      windKph: c.wind_speed_10m,
      windGustKph: c.wind_gusts_10m,
      windDir: degToCompass(c.wind_direction_10m),
      pressureHpa: c.surface_pressure,
      uvIndex: data.daily?.uv_index_max?.[0],
      conditionCode: cond.code,
      conditionLabel: cond.label,
      icon: cond.icon
    };
  },

  async getHourly(lat, lon, tz = 'auto'): Promise<HourPoint[]> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone: tz,
      hourly:
        'temperature_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,weather_code',
      forecast_days: '3',
      wind_speed_unit: 'kmh'
    });
    withOptionalApiKey(params);
    const data = await getJson<{
      hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability: number[];
        precipitation: number[];
        wind_speed_10m: number[];
        wind_gusts_10m: number[];
        relative_humidity_2m: number[];
        weather_code: number[];
      };
    }>(`${FORECAST}?${params}`);
    const h = data.hourly;
    const now = Date.now();
    const out: HourPoint[] = [];
    for (let i = 0; i < h.time.length; i++) {
      const t = new Date(h.time[i]).getTime();
      if (t < now - 3600_000) continue;
      out.push({
        time: new Date(h.time[i]).toISOString(),
        tempC: h.temperature_2m[i],
        rainProbabilityPct: h.precipitation_probability?.[i],
        precipMm: h.precipitation?.[i],
        windKph: h.wind_speed_10m?.[i],
        windGustKph: h.wind_gusts_10m?.[i],
        humidityPct: h.relative_humidity_2m?.[i],
        conditionCode: wmoToCondition(h.weather_code?.[i] ?? 0).code
      });
      if (out.length >= 48) break;
    }
    return out;
  },

  async getDaily(lat, lon, tz = 'auto'): Promise<DailyPoint[]> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone: tz,
      daily:
        'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,weather_code',
      forecast_days: '7',
      wind_speed_unit: 'kmh'
    });
    withOptionalApiKey(params);
    const data = await getJson<{
      daily: {
        time: string[];
        temperature_2m_min: number[];
        temperature_2m_max: number[];
        precipitation_probability_max: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
        weather_code: number[];
      };
    }>(`${FORECAST}?${params}`);
    const d = data.daily;
    const out: DailyPoint[] = [];
    for (let i = 0; i < d.time.length; i++) {
      const cond = wmoToCondition(d.weather_code[i]);
      out.push({
        date: d.time[i],
        minC: d.temperature_2m_min[i],
        maxC: d.temperature_2m_max[i],
        rainProbabilityPct: d.precipitation_probability_max?.[i],
        precipMm: d.precipitation_sum?.[i],
        windKph: d.wind_speed_10m_max?.[i],
        conditionCode: cond.code,
        conditionLabel: cond.label,
        icon: cond.icon
      });
    }
    return out;
  }
};
