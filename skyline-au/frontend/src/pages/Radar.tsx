import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import { useApp } from '../app/AppContext';
import { api } from '../services/api';
import 'leaflet/dist/leaflet.css';
import '../radar-leaflet-overrides.css';

type BomFrame = { file: string; time: string };

function MapRecenter({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], Math.max(map.getZoom(), zoom), { animate: true, duration: 0.35 });
  }, [lat, lon, zoom, map]);
  return null;
}

function formatFrameTime(isoUtc: string): string {
  try {
    const d = new Date(isoUtc);
    return (
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC'
      }).format(d) + ' UTC'
    );
  } catch {
    return isoUtc;
  }
}

export function Radar() {
  const { location, theme } = useApp();
  const isAu = location.country.toUpperCase() === 'AU';

  const [bomMeta, setBomMeta] = useState<{
    site: string;
    bounds: [[number, number], [number, number]] | null;
    frames: BomFrame[];
  } | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [idx, setIdx] = useState(0);

  const loadBom = useCallback(async () => {
    if (!isAu) return;
    try {
      const data = await api.bomRadarFrames(location.state || undefined);
      if (!data.frames.length) throw new Error('No radar frames available');
      setBomMeta(data);
      setLoadErr(null);
      setIdx((i) => Math.min(i, Math.max(0, data.frames.length - 1)));
    } catch (e) {
      setLoadErr((e as Error).message);
      setBomMeta(null);
    }
  }, [isAu, location.state]);

  useEffect(() => {
    void loadBom();
    if (!isAu) return;
    const iv = window.setInterval(() => void loadBom(), 3 * 60_000);
    return () => clearInterval(iv);
  }, [loadBom, isAu]);

  useEffect(() => {
    if (!bomMeta?.frames.length) return;
    if (!playing || bomMeta.frames.length < 2) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % bomMeta.frames.length);
    }, 520);
    return () => clearInterval(id);
  }, [playing, bomMeta?.frames.length]);

  useEffect(() => {
    if (!bomMeta?.frames.length) return;
    setIdx((i) => Math.min(i, bomMeta.frames.length - 1));
  }, [bomMeta?.frames]);

  const mapZoom = isAu ? 7 : 5;
  const nFrames = bomMeta?.frames.length ?? 0;
  const currentFile = bomMeta?.frames[idx]?.file;
  const overlayUrl = currentFile ? `/api/radar/bom/png/${encodeURIComponent(currentFile)}` : '';
  const frameTime = bomMeta?.frames[idx]?.time;

  const gridNote = useMemo(
    () => (theme === 'dark' ? 'radar-map radar-map--dark' : 'radar-map radar-map--light'),
    [theme]
  );

  return (
    <div className="fade-in radar-page">
      <section className="radar-head">
        <div className="label">Precipitation radar</div>
        <div className="radar-sub">
          {isAu ? (
            <>
              {location.name} — radar loop for your state. No street map; colours are reflectivity only.
            </>
          ) : (
            <>
              Official single-source radar is wired for Australia. Outside AU the map shows your location only;
              more regions can be added over time.
            </>
          )}
        </div>
        {loadErr && isAu && (
          <div className="radar-err" role="alert">
            {loadErr}
          </div>
        )}
      </section>

      <div className="radar-map-wrap">
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={mapZoom}
          className={gridNote}
          scrollWheelZoom
          zoomControl={false}
          attributionControl={false}
        >
          <MapRecenter lat={location.lat} lon={location.lon} zoom={mapZoom} />
          {isAu && overlayUrl && bomMeta?.bounds && (
            <ImageOverlay key={currentFile} url={overlayUrl} bounds={bomMeta.bounds} opacity={0.86} interactive={false} />
          )}
        </MapContainer>

        {isAu && bomMeta && nFrames > 0 && (
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
                {frameTime ? (
                  <>
                    Frame {idx + 1}/{nFrames} · {formatFrameTime(frameTime)} · {bomMeta.site}
                  </>
                ) : (
                  <>Loading…</>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="card radar-legend-card">
        <div className="lbl">Reading the map</div>
        <div className="desc radar-legend-desc">
          {isAu
            ? 'Shades show rainfall from official BoM radar PNG timesteps (proxied for the app). The loop uses recent frames. Warnings stay on the Warnings tab.'
            : 'Choose an Australian location to view the radar loop, or check back when your region is supported.'}
        </div>
      </section>
    </div>
  );
}
