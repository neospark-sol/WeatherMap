// WMO weather code → label + emoji icon (Open-Meteo uses WMO codes)
export function wmoToCondition(code: number, isDay = true): { code: string; label: string; icon: string } {
  const night = !isDay;
  const map: Record<number, { code: string; label: string; icon: string }> = {
    0: { code: 'clear', label: 'Clear', icon: night ? '🌙' : '☀️' },
    1: { code: 'mostly-clear', label: 'Mostly clear', icon: night ? '🌙' : '🌤️' },
    2: { code: 'partly', label: 'Partly cloudy', icon: night ? '☁️' : '⛅' },
    3: { code: 'overcast', label: 'Overcast', icon: '☁️' },
    45: { code: 'fog', label: 'Fog', icon: '🌫️' },
    48: { code: 'fog', label: 'Freezing fog', icon: '🌫️' },
    51: { code: 'drizzle', label: 'Light drizzle', icon: '🌦️' },
    53: { code: 'drizzle', label: 'Drizzle', icon: '🌦️' },
    55: { code: 'drizzle', label: 'Heavy drizzle', icon: '🌧️' },
    61: { code: 'rain', label: 'Light rain', icon: '🌦️' },
    63: { code: 'rain', label: 'Rain', icon: '🌧️' },
    65: { code: 'rain', label: 'Heavy rain', icon: '🌧️' },
    66: { code: 'rain', label: 'Freezing rain', icon: '🌧️' },
    67: { code: 'rain', label: 'Freezing rain', icon: '🌧️' },
    71: { code: 'snow', label: 'Light snow', icon: '🌨️' },
    73: { code: 'snow', label: 'Snow', icon: '🌨️' },
    75: { code: 'snow', label: 'Heavy snow', icon: '❄️' },
    77: { code: 'snow', label: 'Snow grains', icon: '🌨️' },
    80: { code: 'showers', label: 'Light showers', icon: '🌦️' },
    81: { code: 'showers', label: 'Showers', icon: '🌧️' },
    82: { code: 'showers', label: 'Heavy showers', icon: '🌧️' },
    85: { code: 'snow', label: 'Snow showers', icon: '🌨️' },
    86: { code: 'snow', label: 'Heavy snow', icon: '❄️' },
    95: { code: 'storm', label: 'Thunderstorm', icon: '⛈️' },
    96: { code: 'storm', label: 'Storm with hail', icon: '⛈️' },
    99: { code: 'storm', label: 'Severe storm', icon: '⛈️' }
  };
  return map[code] ?? { code: 'unknown', label: 'Unknown', icon: '❓' };
}

export function degToCompass(deg?: number): string | undefined {
  if (deg == null) return undefined;
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}
