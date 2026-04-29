import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useApp } from '../app/AppContext';
import { api } from '../services/api';
import type { Location } from '../types';

/** Starting suggestions — Open‑Meteo search finds cities worldwide when you type. */
const POPULAR: Location[] = [
  { id: 'pop-syd', name: 'Sydney', state: 'NSW', country: 'AU', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { id: 'pop-mel', name: 'Melbourne', state: 'VIC', country: 'AU', lat: -37.8136, lon: 144.9631, timezone: 'Australia/Melbourne' },
  { id: 'pop-cbr', name: 'Canberra', state: 'ACT', country: 'AU', lat: -35.2809, lon: 149.13, timezone: 'Australia/Canberra' },
  { id: 'pop-yyz', name: 'Toronto', state: 'Ontario', country: 'CA', lat: 43.6532, lon: -79.3832, timezone: 'America/Toronto' },
  { id: 'pop-yvr', name: 'Vancouver', state: 'British Columbia', country: 'CA', lat: 49.2827, lon: -123.1207, timezone: 'America/Vancouver' },
  { id: 'pop-hou', name: 'Houston', state: 'Texas', country: 'US', lat: 29.7604, lon: -95.3698, timezone: 'America/Chicago' },
  { id: 'pop-mia', name: 'Miami', state: 'Florida', country: 'US', lat: 25.7617, lon: -80.1918, timezone: 'America/New_York' },
  { id: 'pop-khi', name: 'Karachi', state: 'Sindh', country: 'PK', lat: 24.8607, lon: 67.0011, timezone: 'Asia/Karachi' },
  { id: 'pop-bom', name: 'Mumbai', state: 'Maharashtra', country: 'IN', lat: 19.076, lon: 72.8777, timezone: 'Asia/Kolkata' },
  { id: 'pop-del', name: 'New Delhi', state: 'Delhi', country: 'IN', lat: 28.6139, lon: 77.209, timezone: 'Asia/Kolkata' },
  { id: 'pop-sin', name: 'Singapore', state: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' }
];

function mergeSavedFirst(saved: Location[], rows: Location[]): { pinned: Location[]; rest: Location[] } {
  const idSet = new Set(saved.map((s) => s.id));
  const pinned = [...saved];
  const rest = rows.filter((r) => !idSet.has(r.id));
  return { pinned, rest };
}

function LocRow({
  r,
  active,
  onPick,
  starred,
  onStar
}: {
  r: Location;
  active: boolean;
  onPick: () => void;
  starred: boolean;
  onStar: (e: MouseEvent) => void;
}) {
  const sub = [r.state, r.country].filter(Boolean).join(' · ');
  return (
    <div className={'loc-item' + (active ? ' active' : '')} onClick={onPick} onKeyDown={(e) => e.key === 'Enter' && onPick()} role="button" tabIndex={0}>
      <div className="ico">{starred ? '★' : '📍'}</div>
      <div className="info">
        <div className="nm">{r.name}</div>
        <div className="sub">{sub}{r.postcode ? ` · ${r.postcode}` : ''}</div>
      </div>
      <button
        type="button"
        className={'star' + (starred ? ' on' : '')}
        onClick={onStar}
        aria-label={starred ? 'Remove favourite' : 'Add favourite'}
      >
        ★
      </button>
    </div>
  );
}

export function LocationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { location, setLocation, saved, addSaved, removeSaved } = useApp();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Location[]>(POPULAR);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults(POPULAR);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await api.searchLocations(q.trim());
        if (!cancelled) setResults(r);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const { pinned, rest } = useMemo(() => mergeSavedFirst(saved, results), [saved, results]);

  const isSaved = (id: string) => saved.some((s) => s.id === id);

  return (
    <>
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose} aria-hidden={!open} />
      <div className={'sheet' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label="Locations">
        <div className="grabber" />
        <h2>Locations</h2>
        <p className="sheet-hint">Search any city worldwide (Open‑Meteo). ★ favourites stay at the top.</p>
        <div className="search">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.7.7l.27.28v.79l5 5 1.49-1.49-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
          </svg>
          <input
            placeholder="Try Singapore, Houston, Mumbai…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="loc-list">
          {loading && (
            <div className="state">
              <div className="sub">Searching…</div>
            </div>
          )}
          {!loading && pinned.length > 0 && (
            <>
              <div className="loc-section-title">Favourites</div>
              {pinned.map((r) => (
                <LocRow
                  key={r.id}
                  r={r}
                  active={r.id === location.id}
                  starred
                  onPick={() => {
                    setLocation(r);
                    onClose();
                  }}
                  onStar={(e) => {
                    e.stopPropagation();
                    removeSaved(r.id);
                  }}
                />
              ))}
            </>
          )}
          {!loading && (pinned.length > 0 ? <div className="loc-section-title">{q.trim() ? 'Results' : 'Suggestions'}</div> : null)}
          {!loading && pinned.length === 0 && q.trim() === '' && <div className="loc-section-title">Suggestions</div>}
          {!loading && rest.length === 0 && q.trim() !== '' && (
            <div className="state">
              <div className="big">🔍</div>
              <div className="ttl">No matches</div>
              <div className="sub">Try another spelling or city name.</div>
            </div>
          )}
          {!loading &&
            rest.map((r) => (
              <LocRow
                key={r.id}
                r={r}
                active={r.id === location.id}
                starred={isSaved(r.id)}
                onPick={() => {
                  setLocation(r);
                  onClose();
                }}
                onStar={(e) => {
                  e.stopPropagation();
                  isSaved(r.id) ? removeSaved(r.id) : addSaved(r);
                }}
              />
            ))}
        </div>
      </div>
    </>
  );
}
