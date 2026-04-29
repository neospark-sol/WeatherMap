import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Location } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';

const DEFAULT: Location = {
  id: 'syd',
  name: 'Sydney',
  state: 'NSW',
  country: 'AU',
  lat: -33.8688,
  lon: 151.2093,
  timezone: 'Australia/Sydney'
};

type Theme = 'light' | 'dark';
type Ctx = {
  location: Location;
  setLocation: (l: Location) => void;
  saved: Location[];
  addSaved: (l: Location) => void;
  removeSaved: (id: string) => void;
  theme: Theme;
  toggleTheme: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location>(DEFAULT);
  const [saved, setSaved] = useState<Location[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const last = await storage.getLastLocation();
      setSaved(await storage.getSaved());
      const t = await storage.getTheme();
      if (t) setTheme(t);

      if (last) {
        setLocationState(last);
        return;
      }

      if (typeof sessionStorage === 'undefined') return;
      if (sessionStorage.getItem('weathermap-geo-attempted') === '1') return;
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;

      sessionStorage.setItem('weathermap-geo-attempted', '1');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (cancelled) return;
          try {
            const loc = await api.reverse(pos.coords.latitude, pos.coords.longitude);
            setLocationState(loc);
            await storage.setLastLocation(loc);
          } catch {
            /* keep Sydney default */
          }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    void storage.setTheme(theme);
  }, [theme]);

  const setLocation = (l: Location) => {
    setLocationState(l);
    void storage.setLastLocation(l);
  };

  const addSaved = (l: Location) => {
    setSaved((prev) => (prev.find((x) => x.id === l.id) ? prev : [...prev, l]));
    void storage.addSaved(l);
  };

  const removeSaved = (id: string) => {
    setSaved((prev) => prev.filter((x) => x.id !== id));
    void storage.removeSaved(id);
  };

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const value = useMemo(
    () => ({
      location,
      setLocation,
      saved,
      addSaved,
      removeSaved,
      theme,
      toggleTheme
    }),
    [location, saved, theme]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
