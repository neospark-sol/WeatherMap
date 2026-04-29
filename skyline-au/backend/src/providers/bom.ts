import { request } from 'undici';
import { XMLParser } from 'fast-xml-parser';
import type { WarningItem } from '../types.js';

const STATE_PRODUCTS: Record<string, string> = {
  NSW: 'IDZ00054',
  VIC: 'IDZ00056',
  QLD: 'IDZ00057',
  WA: 'IDZ00058',
  SA: 'IDZ00055',
  TAS: 'IDZ00059',
  NT: 'IDZ00060',
  ACT: 'IDZ00054'
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

function severityFromTitle(t: string): WarningItem['severity'] {
  const s = t.toLowerCase();
  if (s.includes('extreme') || s.includes('cyclone')) return 'extreme';
  if (s.includes('severe') || s.includes('flood') || s.includes('major')) return 'severe';
  if (s.includes('warning')) return 'moderate';
  return 'minor';
}

export const bomProvider = {
  async getWarnings(stateCode: string): Promise<WarningItem[]> {
    const id = STATE_PRODUCTS[stateCode.toUpperCase()];
    if (!id) return [];
    const url = `https://www.bom.gov.au/fwo/${id}.xml`;
    try {
      const { body, statusCode } = await request(url, {
        // BOM: identify your app + contact — https://reg.bom.gov.au/other/copyright.shtml
        headers: { 'User-Agent': 'WeatherMap/1.0 (you@yourdomain.com)' },
        headersTimeout: 8000,
        bodyTimeout: 8000
      });
      if (statusCode >= 400) return [];
      const xml = await body.text();
      const doc: Record<string, unknown> = parser.parse(xml);

      const items: WarningItem[] = [];
      const product = (doc?.product ?? doc?.amoc ?? doc) as Record<string, unknown>;
      const warnings = ([] as unknown[])
        .concat((product?.['warning-list'] as { warning?: unknown } | undefined)?.warning ?? [])
        .concat((product?.warnings as { warning?: unknown } | undefined)?.warning ?? [])
        .concat((product?.forecast as { area?: unknown } | undefined)?.area ?? []);
      const issued =
        ((product?.amoc as Record<string, string> | undefined)?.['issue-time-utc'] as string | undefined) ??
        new Date().toISOString();

      for (const w of warnings as Array<Record<string, unknown>>) {
        const title = (w?.title ?? w?.phenomena ?? w?.['@_description'] ?? 'Weather Warning') as string;
        const text = (w?.text ?? w?.summary ?? (w?.['forecast-period'] as Record<string, string> | undefined)?.text ?? '') as string;
        const areas = ([] as unknown[])
          .concat(w?.area ?? [])
          .map((a: unknown) => {
            const rec = a as Record<string, string | undefined>;
            return rec?.['@_description'] ?? rec?.description ?? rec?.name ?? '';
          })
          .filter(Boolean) as string[];
        items.push({
          id: String(w?.['@_id'] ?? w?.id ?? `${id}-${items.length}`),
          severity: severityFromTitle(String(title)),
          title: String(title),
          summary: String(text).slice(0, 600),
          issuedAt: new Date(issued).toISOString(),
          expiresAt: w?.['expiry-time-utc'] ? new Date(String(w['expiry-time-utc'])).toISOString() : null,
          areas: areas.length ? areas : [stateCode],
          source: 'Bureau of Meteorology',
          url
        });
      }
      return items;
    } catch (err) {
      console.warn('[bom] warnings fetch failed:', (err as Error).message);
      return [];
    }
  }
};
