import { request } from 'undici';
import type { WarningItem } from '../types.js';

/** Free US alerts: https://www.weather.gov/documentation/services-web-algorithm (point query). */
function mapNwsSeverity(s: string | undefined): WarningItem['severity'] {
  const x = (s ?? '').toLowerCase();
  if (x === 'extreme') return 'extreme';
  if (x === 'severe') return 'severe';
  if (x === 'moderate') return 'moderate';
  return 'minor';
}

export async function getNwsActiveAlerts(lat: number, lon: number): Promise<WarningItem[]> {
  const url = `https://api.weather.gov/alerts/active?status=actual&point=${encodeURIComponent(`${lat},${lon}`)}`;
  const { body, statusCode } = await request(url, {
    headers: {
      'User-Agent': process.env.NWS_USER_AGENT ?? 'SkylineAU/1.0 (contact@example.com)',
      Accept: 'application/geo+json'
    },
    headersTimeout: 12000,
    bodyTimeout: 12000
  });
  if (statusCode >= 400) return [];
  const data = (await body.json()) as {
    features?: Array<{
      id: string;
      properties?: {
        id?: string;
        event?: string;
        headline?: string;
        description?: string;
        severity?: string;
        effective?: string;
        expires?: string;
        areaDesc?: string;
      };
    }>;
  };
  const items: WarningItem[] = [];
  for (const f of data.features ?? []) {
    const p = f.properties;
    if (!p) continue;
    const title = p.event ?? p.headline ?? 'Weather alert';
    const summary = (p.description ?? p.headline ?? '').slice(0, 800);
    items.push({
      id: String(p.id ?? f.id ?? `nws-${items.length}`),
      severity: mapNwsSeverity(p.severity),
      title,
      summary,
      issuedAt: p.effective ? new Date(p.effective).toISOString() : new Date().toISOString(),
      expiresAt: p.expires ? new Date(p.expires).toISOString() : null,
      areas: p.areaDesc ? p.areaDesc.split(';').map((x) => x.trim()).filter(Boolean) : [],
      source: 'National Weather Service (US)',
      url: 'https://www.weather.gov/alerts'
    });
  }
  return items;
}
