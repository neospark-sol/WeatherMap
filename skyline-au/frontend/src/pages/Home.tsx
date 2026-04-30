import { useEffect, useState } from 'react';
import { useApp } from '../app/AppContext';
import { useWarnings, useWeather } from '../hooks/useWeather';
import { HourlyStrip } from '../components/HourlyStrip';
import { HourlyChart } from '../components/HourlyChart';
import { DailyList } from '../components/DailyList';
import { moodFor } from '../util/mood';
import { useNavigate } from 'react-router-dom';

type Metric = 'temp' | 'rain' | 'wind';

export function Home({ refreshKey, setMood }: { refreshKey: number; setMood: (m: string) => void }) {
  const { location } = useApp();
  const nav = useNavigate();
  const { current, hourly, daily, loading, error } = useWeather(location, refreshKey);
  const { items: warnings } = useWarnings(location, refreshKey);

  const [metric, setMetric] = useState<Metric>('temp');
  const [range, setRange] = useState<number>(24);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    setMood(moodFor(current));
  }, [current, setMood]);

  const today = daily[0];

  if (loading && !current) {
    return (
      <div className="fade-in">
        <div className="hero">
          <div className="label skel" style={{ width: 100, height: 14, margin: '0 auto 12px' }} />
          <div className="skel" style={{ width: 96, height: 96, borderRadius: '50%', margin: '6px auto' }} />
          <div className="skel" style={{ width: 140, height: 60, margin: '8px auto' }} />
          <div className="skel" style={{ width: 180, height: 16, margin: '10px auto' }} />
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="state">
        <div className="big">🌐</div>
        <div className="ttl">Couldn't load weather</div>
        <div className="sub">{error ?? 'Check your connection and try again.'}</div>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const warnSevere = warnings.some((w) => w.severity === 'severe' || w.severity === 'extreme');

  return (
    <div className="fade-in">
      {warnings.length > 0 && (
        <div
          className={'warn-banner' + (warnSevere ? ' severe' : '')}
          onClick={() => nav('/warnings')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && nav('/warnings')}
        >
          <div className="dot" />
          <div className="txt">
            <div className="title">{warnings[0].title}</div>
            <div className="sub">
              {warnings[0].areas.join(', ')} • {warnings.length} active
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M10 6l6 6-6 6V6z" />
          </svg>
        </div>
      )}

      <section className="hero">
        <div className="label">{location.name} • Now</div>
        <div className="icon-big">{current.icon}</div>
        <div className="temp">
          <span>{Math.round(current.temperatureC)}</span>
          <span className="deg">°</span>
        </div>
        <div className="cond">{current.conditionLabel}</div>
        <div className="range">
          {today && (
            <>
              H {Math.round(today.maxC)}° • L {Math.round(today.minC)}°
            </>
          )}
          {current.feelsLikeC != null && <> • Feels {Math.round(current.feelsLikeC)}°</>}
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <div className="ico">💨</div>
          <div className="k">Wind</div>
          <div className="v">{Math.round(current.windKph ?? 0)} km/h</div>
        </div>
        <div className="stat">
          <div className="ico">💧</div>
          <div className="k">Humidity</div>
          <div className="v">{current.humidityPct ?? '—'}%</div>
        </div>
        <div className="stat">
          <div className="ico">☀️</div>
          <div className="k">UV</div>
          <div className="v">{current.uvIndex != null ? Math.round(current.uvIndex) : '—'}</div>
        </div>
        <div className="stat">
          <div className="ico">🌧️</div>
          <div className="k">Rain</div>
          <div className="v">{hourly[0]?.rainProbabilityPct ?? 0}%</div>
        </div>
      </section>

      <section className="card">
        <h3>
          Hourly <span className="pill">Next 24h</span>
        </h3>
        <HourlyStrip hours={hourly} selectedIdx={sel} onSelect={setSel} />
      </section>

      <section className="card">
        <h3>Forecast Chart</h3>
        <div className="chart-tabs">
          {(['temp', 'rain', 'wind'] as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              className={'chart-tab' + (metric === m ? ' active' : '')}
              onClick={() => setMetric(m)}
            >
              {m === 'temp' ? 'Temperature' : m === 'rain' ? 'Rain' : 'Wind'}
            </button>
          ))}
        </div>
        <div className="range-tabs">
          {[12, 24, 48].map((r) => (
            <button
              key={r}
              type="button"
              className={'range-tab' + (range === r ? ' active' : '')}
              onClick={() => setRange(r)}
            >
              {r}h
            </button>
          ))}
        </div>
        <div className="chart-wrap">
          <HourlyChart hours={hourly} metric={metric} range={range} selectedIdx={sel} onSelect={setSel} />
        </div>
      </section>

      <section className="card">
        <h3>7-Day Forecast</h3>
        <DailyList days={daily} />
      </section>

      <section className="card" style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 11.5 }}>
        <span style={{ opacity: 0.85 }}>Updated </span>
        <span style={{ opacity: 0.7 }}>
          {new Date(current.observedAt).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </section>

      {error && (
        <div style={{ textAlign: 'center', color: 'var(--warn)', fontSize: 11.5, marginBottom: 12 }}>{error}</div>
      )}
    </div>
  );
}
