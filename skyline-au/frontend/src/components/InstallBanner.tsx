import { useEffect, useState } from 'react';

export function InstallBanner() {
  const [evt, setEvt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e);
      if (!sessionStorage.getItem('install-dismissed')) {
        setTimeout(() => setShow(true), 2000);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="install show">
      <div className="ico">⛅</div>
      <div className="info">
        <div className="t">Install Skyline AU</div>
        <div className="s">Get fast access from your home screen</div>
      </div>
      <button
        type="button"
        onClick={async () => {
          const e = evt as { prompt?: () => void; userChoice?: Promise<{ outcome: string }> } | null;
          if (!e?.prompt) return;
          e.prompt();
          await e.userChoice;
          setShow(false);
        }}
      >
        Install
      </button>
      <button
        type="button"
        className="x"
        onClick={() => {
          sessionStorage.setItem('install-dismissed', '1');
          setShow(false);
        }}
      >
        ✕
      </button>
    </div>
  );
}
