import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './app/AppContext';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { Home } from './pages/Home';
import { Warnings } from './pages/Warnings';
import { Saved } from './pages/Saved';
import { Settings } from './pages/Settings';
import { Radar } from './pages/Radar';
import { LocationSheet } from './components/LocationSheet';
import { InstallBanner } from './components/InstallBanner';
import './styles.css';

function Shell() {
  const [sheet, setSheet] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mood, setMood] = useState('day');

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="app" data-mood={mood}>
      <div className="backdrop">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <Header onOpenLocations={() => setSheet(true)} onRefresh={refresh} />

      <main>
        <Routes>
          <Route path="/" element={<Home refreshKey={refreshKey} setMood={setMood} />} />
          <Route path="/radar" element={<Radar />} />
          <Route path="/warnings" element={<Warnings refreshKey={refreshKey} />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <LocationSheet open={sheet} onClose={() => setSheet(false)} />
      <InstallBanner />
      <TabBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProvider>
  );
}
