import type { WeatherProvider, WarningQuery } from '../types.js';
import { mockProvider } from './mock.js';
import { openMeteoProvider } from './openMeteo.js';
import { bomProvider } from './bom.js';
import { getNwsActiveAlerts } from './nws.js';

export function buildProvider(): WeatherProvider {
  const mode = process.env.PROVIDER ?? 'live';
  if (mode === 'live') {
    return {
      searchLocations: async (q, cc) => {
        return await openMeteoProvider.searchLocations(q, cc);
      },
      getCurrent: async (lat, lon, tz) => {
        return await openMeteoProvider.getCurrent(lat, lon, tz);
      },
      getHourly: async (lat, lon, tz) => {
        return await openMeteoProvider.getHourly(lat, lon, tz);
      },
      getDaily: async (lat, lon, tz) => {
        return await openMeteoProvider.getDaily(lat, lon, tz);
      },
      getWarnings: async (query: WarningQuery) => {
        const country = query.country.toUpperCase();
        try {
          if (country === 'AU') {
            // Never fall back to mock warnings in live mode — empty BOM feed means no warnings.
            return await bomProvider.getWarnings(query.state ?? 'NSW');
          }
          if (country === 'US' && query.lat != null && query.lon != null) {
            return await getNwsActiveAlerts(query.lat, query.lon);
          }
        } catch {
          // AU: BOM failure → show none, not demo alerts labelled as BoM.
        }
        return [];
      }
    };
  }
  return mockProvider;
}
