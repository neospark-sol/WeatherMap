import { NavLink } from 'react-router-dom';

export function TabBar() {
  return (
    <nav className="tabbar">
      <NavLink to="/" end className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M6.34 8.46A6 6 0 0118 9a4.5 4.5 0 01-.5 8.95H7a5 5 0 01-.66-9.49z" />
        </svg>
        Today
      </NavLink>
      <NavLink to="/radar" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          <path d="M17.5 18c-1.78 2.2-4.48 3.5-8 3.5-1.74 0-3.31-.35-4.64-.97.95 1.56 3.4 4.47 7.64 4.47 4.25 0 6.69-2.9 7.64-4.47-1.33.62-2.9.97-4.64.97z" opacity=".45" />
        </svg>
        Radar
      </NavLink>
      <NavLink to="/warnings" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2L1 21h22L12 2zm0 4.5L19.5 19h-15L12 6.5zM11 10v5h2v-5h-2zm0 6v2h2v-2h-2z" />
        </svg>
        Alerts
      </NavLink>
      <NavLink to="/saved" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
        </svg>
        Saved
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.14 12.94a7.96 7.96 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.61-.22l-2.39.96a7.97 7.97 0 00-1.62-.94l-.36-2.54A.5.5 0 0014 2h-4a.5.5 0 00-.5.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 00-.61.22L2.6 8.48a.5.5 0 00.12.64l2.03 1.58a8.04 8.04 0 000 1.88L2.72 14.16a.5.5 0 00-.12.64l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.5.39 1.03.7 1.62.94l.36 2.54c.05.24.26.42.5.42h4c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.26.12.55.02.69-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
        </svg>
        Settings
      </NavLink>
    </nav>
  );
}
