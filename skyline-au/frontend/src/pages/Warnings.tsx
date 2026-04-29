import { useApp } from '../app/AppContext';
import { useWarnings } from '../hooks/useWeather';

const ALERTS_COUNTRIES = new Set(['AU', 'US']);

export function Warnings({ refreshKey }: { refreshKey: number }) {
  const { location } = useApp();
  const { items, loading } = useWarnings(location, refreshKey);
  const alertsSupported = ALERTS_COUNTRIES.has(location.country.toUpperCase());

  return (
    <div className="fade-in">
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="label">Active warnings</div>
        <div className="icon-big">⚠️</div>
        <div className="cond">
          {loading ? 'Checking…' : items.length === 0 ? (alertsSupported ? 'All clear' : 'No feed') : `${items.length} active`}
        </div>
        <div className="range">
          {location.name}
          {location.state ? `, ${location.state}` : ''} · {location.country}
        </div>
      </section>

      {!loading && items.length === 0 && (
        <div className="state">
          <div className="big">{alertsSupported ? '✅' : 'ℹ️'}</div>
          <div className="ttl">{alertsSupported ? 'No active warnings' : 'Hazard feed not connected'}</div>
          <div className="sub">
            {alertsSupported
              ? `${location.name} and surrounding areas look clear in the national feed.`
              : `Government warnings for ${location.country} are not wired in this app yet. Your forecast on Today is still live (Open‑Meteo). AU uses BOM; US uses NWS.`}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="warn-list">
          {items.map((w) => {
            const issued = new Date(w.issuedAt).toLocaleString(undefined, {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit'
            });
            const sevClass =
              w.severity === 'extreme' ? 'extreme' : w.severity === 'severe' ? 'severe' : w.severity;
            return (
              <div key={w.id} className={'warn-item ' + sevClass}>
                <span className="lvl">{w.severity}</span>
                <div className="ttl">{w.title}</div>
                <div className="meta">
                  Issued {issued} · {w.source}
                </div>
                <div className="body">{w.summary}</div>
                <div className="meta" style={{ marginTop: 8 }}>
                  📍 {w.areas.join(' • ')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
