import type { CapacitorConfig } from '@capacitor/cli';

/** Production PWA URL — the APK loads the live site (same as browser install). */
const SERVER_URL =
  process.env.WEATHERMAP_SERVER_URL ?? 'https://weathermap-production-b085.up.railway.app';

const config: CapacitorConfig = {
  appId: 'com.neosparksol.weathermap',
  appName: 'WeatherMap',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: SERVER_URL,
    cleartext: false
  }
};

export default config;
