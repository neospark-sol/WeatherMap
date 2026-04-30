import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../app/AppContext';
import 'leaflet/dist/leaflet.css';

const WEATHER_MAPS_URL = 'https://api.rainviewer.com/public/weather-maps.json';

type RvFrame = { time: number; path: string };

type RvResponse = {
  host: string;
  generated?: number;
  radar?: { past?: RvFrame[]; nowcast?: RvFrame[] };
};

function MapRecenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], Math.max(map.getZoom(), 5), { animate: true, duration: 0.35 });
  }, [lat, lon, map]);
  return null;
}

function AnimatedRadarOverlay({
  host,
  frames,
  playing,
  onFrame
}: {
  host: string;
  frames: RvFrame[];
  playing: boolean;
  onFrame: (idx: number, unixSec: number) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
  const [idx, setIdx] = useState(() => Math.max(0, frames.length - 1));

  useEffect(() => {
    if (!frames.length) return;
    const path = frames[idx]!.path;
    const url = `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`;
    if (!layerRef.current) {
      const lyr = L.tileLayer(url, {
        opacity: 0.82,
        maxNativeZoom: 7,
        maxZoom: 12,
        zIndex: 450,
        attribution:
          'Radar tiles <a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>'
      });
      lyr.addTo(map);
      layerRef.current = lyr;
    } else {
      layerRef.current.setUrl(url);
    }
    onFrame(idx, frames[idx]!.time);
  }, [map, host, frames, idx, onFrame]);

  useEffect(() => {
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, 520);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  useEffect(() => {
    if (!frames.length) return;
    setIdx((i) => Math.min(i, frames.length - 1));
  }, [frames.length]);

  return null;
}

function formatFrameTime(unixSec: number): string {
  try {
    return (
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC'
      }).format(new Date(unixSec * 1000)) + ' UTC'
    );
  } catch {
    return new Date(unixSec * 1000).toISOString();
  }
}

export function Radar() {
  const { location, theme } = useApp();
  const [meta, setMeta] = useState<{ host: string; frames: RvFrame[]; generated?: number } | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [hud, setHud] = useState({ idx: 0, unix: 0 });

  const onFrame = useCallback((idx: number, unixSec: number) => {
    setHud((h) => (h.idx === idx && h.unix === unixSec ? h : { idx, unix: unixSec }));
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch(WEATHER_MAPS_URL);
      if (!res.ok) throw new Error('Radar feed unavailable');
      const j = (await res.json()) as RvResponse;
      if (!j.host || typeof j.host !== 'string') throw new Error('Invalid radar feed (no host)');
      const past = Array.isArray(j.radar?.past) ? j.radar!.past! : [];
      const nowcast = Array.isArray(j.radar?.nowcast) ? j.radar!.nowcast! : [];
      const frames = [...past, ...nowcast].filter(
        (f): f is RvFrame => f && typeof f.path === 'string' && typeof f.time === 'number'
      );
      if (!frames.length) throw new Error('No radar frames in feed');
      setMeta({ host: j.host.replace(/\/$/, ''), frames, generated: j.generated });
      setLoadErr(null);
    } catch (e) {
      setLoadErr((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
    const iv = window.setInterval(() => void load(), 5 * 60_000);
    return () => clearInterval(iv);
  }, [load]);

  const basemap = useMemo(
    () =>
      theme === 'dark'
        ? {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          }
        : {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          },
    [theme]
  );

  const nFrames = meta?.frames.length ?? 0;

  return (
    <div className="fade-in radar-page">
      <section className="radar-head">
        <div className="label">Precipitation radar</div>
        <div className="radar-sub">
          {location.name} — past ~2h plus short nowcast where available. Map centers on your selected city.
        </div>
        {loadErr && (
          <div className="radar-err" role="alert">
            {loadErr}
          </div>
        )}
      </section>

      <div className="radar-map-wrap">
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={6}
          className="radar-map"
          scrollWheelZoom
          zoomControl
        >
          <TileLayer attribution={basemap.attribution} url={basemap.url} maxZoom={19} />
          <MapRecenter lat={location.lat} lon={location.lon} />
          {meta && meta.frames.length > 0 && (
            <AnimatedRadarOverlay
              key={meta.generated ?? meta.frames[meta.frames.length - 1]!.time}
              host={meta.host}
              frames={meta.frames}
              playing={playing}
              onFrame={onFrame}
            />
          )}
        </MapContainer>

        {meta && meta.frames.length > 0 && (
          <div className="radar-hud">
            <button
              type="button"
              className={'radar-play' + (playing ? ' on' : '')}
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause animation' : 'Play animation'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <div className="radar-meta">
              <div className="radar-time-line">
                {hud.unix ? (
                  <>
                    Frame {hud.idx + 1}/{nFrames} · {formatFrameTime(hud.unix)}
                  </>
                ) : (
                  <>Loading frames…</>
                )}
              </div>
              <a className="radar-credit" href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">
                Radar: RainViewer
              </a>
            </div>
          </div>
        )}
      </div>

      <section className="card radar-legend-card">
        <div className="lbl">Reading the map</div>
        <div className="desc radar-legend-desc">
          Colours show composite radar reflectivity worldwide (coverage varies by region). The loop steps through recent
          snapshots so you can see motion. For official Australian warnings use the Warnings tab (BoM feed).
          <br />
          <br />
          Maps use{' '}
          <a href="https://leafletjs.com/" target="_blank" rel="noreferrer">
            Leaflet
          </a>{' '}
          (open-source mapping library; no ads injected by the stack). Basemap: OpenStreetMap / CARTO; radar: RainViewer.
          Required attribution appears in the map corner.
        </div>
      </section>
    </div>
  );
}
