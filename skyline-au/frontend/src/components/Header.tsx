import { useApp } from '../app/AppContext';

export function Header({ onOpenLocations, onRefresh }: { onOpenLocations: () => void; onRefresh: () => void }) {
  const { location, theme, toggleTheme } = useApp();
  return (
    <header className="topbar">
      <button type="button" className="loc-pill" onClick={onOpenLocations}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
        </svg>
        <span className="loc-pill-text">
          {location.name}
          {(location.state || location.country) && (
            <>
              <span className="loc-pill-sub">
                {' '}
                · {[location.state, location.country].filter(Boolean).join(', ')}
              </span>
            </>
          )}
        </span>
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }} aria-hidden>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <div className="top-actions">
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 01-4.4 2.26 5.4 5.4 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </button>
        <button type="button" className="icon-btn" onClick={onRefresh} aria-label="Refresh">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 00-8 8 8 8 0 008 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18a6 6 0 110-12c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
