import type { CurrentConditions } from '../types';

export function moodFor(c: CurrentConditions | null): 'day' | 'night' | 'rain' | 'storm' {
  if (!c) return 'day';
  const code = c.conditionCode;
  if (code.includes('storm')) return 'storm';
  if (code.includes('rain') || code.includes('shower') || code.includes('drizzle')) return 'rain';
  const h = new Date(c.observedAt).getHours();
  if (h < 6 || h >= 19) return 'night';
  return 'day';
}
