import { Client } from 'basic-ftp';
import { Writable } from 'node:stream';

const FTP_DIR = '/anon/gen/radar';
const FILE_RE = /^IDR(\d{3})\.T\.(\d{12})\.png$/;

/** Radar centres + nominal ground range for ImageOverlay bounds (approximate). */
export const BOM_RADAR_SITES: Record<string, { lat: number; lon: number; rangeKm: number }> = {
  IDR714: { lat: -33.7008, lon: 151.2093, rangeKm: 256 }, // Sydney (Terry Hills)
  IDR023: { lat: -37.855, lon: 144.7555, rangeKm: 256 }, // Melbourne
  IDR413: { lat: -27.7178, lon: 153.24, rangeKm: 256 }, // Brisbane (Mt Stapylton)
  IDR923: { lat: -34.9524, lon: 138.5194, rangeKm: 256 }, // Adelaide (Buckley's Knob)
  IDR703: { lat: -32.3917, lon: 115.8669, rangeKm: 256 }, // Perth (Carnamah / Serpentine area — nominal)
  IDR633: { lat: -12.4611, lon: 130.9264, rangeKm: 256 }, // Darwin
  IDR483: { lat: -43.1122, lon: 147.8063, rangeKm: 256 }, // Hobart (Mt Koonya)
  IDR163: { lat: -35.3084, lon: 149.2067, rangeKm: 256 } // Canberra
};

export const AU_STATE_TO_RADAR: Record<string, string> = {
  NSW: 'IDR714',
  ACT: 'IDR163',
  VIC: 'IDR023',
  QLD: 'IDR413',
  SA: 'IDR923',
  WA: 'IDR703',
  NT: 'IDR633',
  TAS: 'IDR483'
};

export function radarSiteForAuState(state: string | undefined): string {
  const k = (state ?? '').toUpperCase();
  return AU_STATE_TO_RADAR[k] ?? 'IDR714';
}

function bboxFromCenter(lat: number, lon: number, rangeKm: number): [[number, number], [number, number]] {
  const dLat = rangeKm / 111.32;
  const rad = (lat * Math.PI) / 180;
  const dLon = rangeKm / (111.32 * Math.max(Math.cos(rad), 0.2));
  return [
    [lat - dLat, lon - dLon],
    [lat + dLat, lon + dLon]
  ];
}

export function boundsForSite(siteId: string): [[number, number], [number, number]] | null {
  const s = BOM_RADAR_SITES[siteId.toUpperCase()];
  if (!s) return null;
  return bboxFromCenter(s.lat, s.lon, s.rangeKm);
}

function parseTimeFromName(filename: string): string | null {
  const m = FILE_RE.exec(filename);
  if (!m) return null;
  const y = m[2]!.slice(0, 4),
    mo = m[2]!.slice(4, 6),
    d = m[2]!.slice(6, 8),
    h = m[2]!.slice(8, 10),
    mi = m[2]!.slice(10, 12);
  return `${y}-${mo}-${d}T${h}:${mi}:00Z`;
}

export type BomFrame = { file: string; time: string };

async function withFtp<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  const c = new Client(12_000);
  c.ftp.verbose = false;
  try {
    await c.access({
      host: 'ftp.bom.gov.au',
      user: 'anonymous',
      password: 'guest@',
      secure: false
    });
    return await fn(c);
  } finally {
    c.close();
  }
}

export async function listBomRadarFrames(siteId: string, limit = 32): Promise<BomFrame[]> {
  const prefix = `${siteId.toUpperCase()}.T.`;
  return withFtp(async (c) => {
    const entries = await c.list(FTP_DIR);
    const files = entries
      .filter((e) => e.name.startsWith(prefix) && e.name.endsWith('.png') && FILE_RE.test(e.name))
      .map((e) => e.name)
      .sort();
    const slice = files.slice(Math.max(0, files.length - limit));
    const out: BomFrame[] = [];
    for (const file of slice) {
      const time = parseTimeFromName(file);
      if (time) out.push({ file, time });
    }
    return out;
  });
}

export async function fetchBomRadarPng(filename: string): Promise<Buffer> {
  if (!FILE_RE.test(filename)) throw new Error('invalid radar filename');
  const filepath = `${FTP_DIR}/${filename}`;
  return withFtp(async (c) => {
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk: Buffer, _enc, cb) {
        chunks.push(Buffer.from(chunk));
        cb();
      }
    });
    await c.downloadTo(sink, filepath);
    return Buffer.concat(chunks);
  });
}
