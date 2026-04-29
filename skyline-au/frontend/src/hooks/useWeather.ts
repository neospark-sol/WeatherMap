import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import type { Location, CurrentConditions, HourPoint, DailyPoint, WarningItem } from '../types';

export type WeatherBundle = {
  current: CurrentConditions | null;
  hourly: HourPoint[];
  daily: DailyPoint[];
  loading: boolean;
  error: string | null;
};

export function useWeather(loc: Location, refreshKey = 0): WeatherBundle {
  const [state, setState] = useState<WeatherBundle>({
    current: null,
    hourly: [],
    daily: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;
    let cachedBundle: WeatherBundle | null = null;
    const cacheKey = `weather:${loc.lat},${loc.lon},${loc.timezone}`;

    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));

      const cached = await storage.getCached<WeatherBundle>(cacheKey);
      if (cached && !cancelled) {
        cachedBundle = cached;
        setState({ ...cached, loading: true, error: null });
      }

      try {
        const [current, hourly, daily] = await Promise.all([
          api.current(loc.lat, loc.lon, loc.timezone),
          api.hourly(loc.lat, loc.lon, loc.timezone),
          api.daily(loc.lat, loc.lon, loc.timezone)
        ]);
        if (cancelled) return;
        const bundle: WeatherBundle = { current, hourly, daily, loading: false, error: null };
        setState(bundle);
        await storage.setCached(cacheKey, bundle);
      } catch (e) {
        if (cancelled) return;
        if (cachedBundle) {
          setState({
            ...cachedBundle,
            loading: false,
            error: "Showing cached data — couldn't reach the network"
          });
        } else {
          setState({
            current: null,
            hourly: [],
            daily: [],
            loading: false,
            error: (e as Error).message
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loc.lat, loc.lon, loc.timezone, refreshKey]);

  return state;
}

export function useWarnings(loc: Pick<Location, 'country' | 'state' | 'lat' | 'lon'>, refreshKey = 0) {
  const [items, setItems] = useState<WarningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await api.warnings(loc);
        if (!cancelled) setItems(r);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loc.country, loc.state, loc.lat, loc.lon, refreshKey]);

  return { items, loading };
}
