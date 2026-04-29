import { useEffect, useState } from 'react';
import { useApp } from '../app/AppContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { CurrentConditions, Location } from '../types';

export function Saved() {
  const { saved, location, setLocation, removeSaved } = useApp();
  const nav = useNavigate();
  const [snapshots, setSnapshots] = useState<Record<string, CurrentConditions>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: Record<string, CurrentConditions> = {};
      for (const s of saved) {
        try {
          const c = await api.current(s.lat, s.lon, s.timezone);
          if (cancelled) return;
          out[s.id] = c;
          setSnapshots({ ...out });
        } catch {
          /* ignore single failures */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [saved]);

  const open = (l: Location) => {
    setLocation(l);
    nav('/');
  };

  return (
    <div className="fade-in">
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="label">My Locations</div>
        <div className="icon-big">📍</div>
        <div className="cond">{saved.length} saved</div>
      </section>
      {saved.length === 0 ? (
        <div className="state">
          <div className="big">🌏</div>
          <div className="ttl">No saved locations</div>
          <div className="sub">Tap the location pill at the top to add places.</div>
        </div>
      ) : (
        <div className="loc-list" style={{ padding: '0 12px' }}>
          {saved.map((s) => {
            const snap = snapshots[s.id];
            return (
              <div
                key={s.id}
                className={'loc-item' + (s.id === location.id ? ' active' : '')}
                onClick={() => open(s)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && open(s)}
              >
                <div className="ico">{snap?.icon ?? '📍'}</div>
                <div className="info">
                  <div className="nm">{s.name}</div>
                  <div className="sub">
                    {s.state}
                    {snap ? ` • ${snap.conditionLabel}` : ''}
                  </div>
                </div>
                <div className="tmp">{snap ? `${Math.round(snap.temperatureC)}°` : '—'}</div>
                <button
                  type="button"
                  className="star on"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSaved(s.id);
                  }}
                  aria-label="Remove"
                >
                  ★
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
