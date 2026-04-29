import { request } from 'undici';
import type { Location } from '../types.js';

/**
 * Nominatim (OpenStreetMap) reverse geocoding — free, rate-limited; identify with User-Agent per their policy.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
export async function nominatimReverse(lat: number, lon: number): Promise<Location> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&format=json&addressdetails=1`;
  const { body, statusCode } = await request(url, {
    headers: {
      'User-Agent': process.env.NOMINATIM_USER_AGENT ?? 'WeatherMap/1.0 (contact@example.com)'
    },
    headersTimeout: 10000,
    bodyTimeout: 10000
  });
  if (statusCode >= 400) throw new Error(`nominatim ${statusCode}`);
  const d = (await body.json()) as {
    place_id: number;
    lat: string;
    lon: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      region?: string;
      state_district?: string;
      country?: string;
      country_code?: string;
      postcode?: string;
    };
  };
  const a = d.address ?? {};
  const name = a.city ?? a.town ?? a.village ?? a.state ?? a.region ?? 'Location';
  const state = a.state ?? a.region ?? a.state_district ?? '';
  const country = (a.country_code ?? '').toUpperCase() || 'XX';
  return {
    id: `osm-${d.place_id}`,
    name,
    state,
    country,
    postcode: a.postcode,
    lat: Number(d.lat),
    lon: Number(d.lon),
    timezone: 'auto'
  };
}
