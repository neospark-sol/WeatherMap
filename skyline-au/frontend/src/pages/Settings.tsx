import { useApp } from '../app/AppContext';

export function Settings() {
  const { theme, toggleTheme } = useApp();
  return (
    <div className="fade-in">
      <section className="hero" style={{ paddingBottom: 12 }}>
        <div className="label">Settings</div>
        <div className="icon-big">⚙️</div>
        <div className="cond">WeatherMap</div>
        <div className="range">v0.1</div>
      </section>
      <section className="card">
        <div className="setting-row">
          <div>
            <div className="lbl">Dark mode</div>
            <div className="desc">Calm night-friendly palette</div>
          </div>
          <button type="button" className={'toggle' + (theme === 'dark' ? ' on' : '')} onClick={toggleTheme}>
            <span className="knob" />
          </button>
        </div>
        <div className="setting-row">
          <div>
            <div className="lbl">Units</div>
            <div className="desc">°C, km/h, mm, hPa</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Metric ›</div>
        </div>
        <div className="setting-row">
          <div>
            <div className="lbl">Data</div>
            <div className="desc">Live forecasts and radar from public services. Warnings use official feeds where wired.</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--good)' }}>● Live</div>
        </div>
      </section>
      <section className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>
          WeatherMap — for personal use.
          <br />
          Not affiliated with third-party weather brands.
        </div>
      </section>
    </div>
  );
}
