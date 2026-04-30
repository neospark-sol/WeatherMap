import type { Location, CurrentConditions, HourPoint, DailyPoint, WarningItem } from '../types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

function tzQ(tz?: string) {
  return tz ? `&tz=${encodeURIComponent(tz)}` : '';
}

export const api = {
  searchLocations: (q: string, countryCode?: string) => {
    let path = `/location/search?q=${encodeURIComponent(q)}`;
    if (countryCode) path += `&country=${encodeURIComponent(countryCode)}`;
    return get<{ results: Location[] }>(path).then((r) => r.results);
  },
  reverse: (lat: number, lon: number) => get<Location>(`/location/reverse?lat=${lat}&lon=${lon}`),
  current: (lat: number, lon: number, tz?: string) =>
    get<CurrentConditions>(`/weather/current?lat=${lat}&lon=${lon}${tzQ(tz)}`),
  hourly: (lat: number, lon: number, tz?: string) =>
    get<{ points: HourPoint[] }>(`/weather/hourly?lat=${lat}&lon=${lon}${tzQ(tz)}`).then((r) => r.points),
  daily: (lat: number, lon: number, tz?: string) =>
    get<{ days: DailyPoint[] }>(`/weather/daily?lat=${lat}&lon=${lon}${tzQ(tz)}`).then((r) => r.days),
  warnings: (loc: Pick<Location, 'country' | 'state' | 'lat' | 'lon'>) => {
    const p = new URLSearchParams({
      country: loc.country,
      state: loc.state ?? '',
      lat: String(loc.lat),
      lon: String(loc.lon)
    });
    return get<{ warnings: WarningItem[] }>(`/warnings?${p}`).then((r) => r.warnings);
  },
  bomRadarFrames: (state?: string) => {
    const q = state ? `?state=${encodeURIComponent(state)}` : '';
    return get<{
      site: string;
      bounds: [[number, number], [number, number]] | null;
      frames: { file: string; time: string }[];
    }>(`/radar/bom/frames${q}`);
  }
};
