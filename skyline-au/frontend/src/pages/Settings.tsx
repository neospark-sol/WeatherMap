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
            <div className="lbl">Data sources</div>
            <div className="desc">
              Forecast &amp; search: Open-Meteo (no key). AU official warnings: BoM FTP/HTTP XML caps (e.g. IDZ00054
              NSW). US alerts: api.weather.gov. Global radar loop: RainViewer public tiles (personal/educational use —
              see rainviewer.com/api).
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--good)' }}>● Live</div>
        </div>
      </section>
      <section className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>
          Built with original data sources.
          <br />
          Forecast: Open-Meteo · AU warnings: BoM · US alerts: NWS · Radar mosaic: RainViewer
          <br />
          Not affiliated with Weatherzone.
        </div>
      </section>
    </div>
  );
}
