import type { HourPoint } from '../types';

function iconFor(h: HourPoint, hourOfDay: number) {
  if ((h.rainProbabilityPct ?? 0) > 70) return '⛈️';
  if ((h.rainProbabilityPct ?? 0) > 45) return '🌧️';
  if ((h.rainProbabilityPct ?? 0) > 25) return '🌦️';
  if ((h.rainProbabilityPct ?? 0) > 10) return '⛅';
  if (hourOfDay < 6 || hourOfDay > 19) return '🌙';
  return '☀️';
}

export function HourlyStrip({
  hours,
  selectedIdx,
  onSelect
}: {
  hours: HourPoint[];
  selectedIdx: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="hourly-strip">
      {hours.slice(0, 24).map((h, i) => {
        const t = new Date(h.time);
        const hr = t.getHours();
        const isNow = i === 0;
        const label = isNow ? 'Now' : hr === 0 ? '12am' : hr < 12 ? `${hr}am` : hr === 12 ? '12pm' : `${hr - 12}pm`;
        const cls = 'hour' + (isNow ? ' now' : '') + (i === selectedIdx ? ' selected' : '');
        return (
          <button type="button" key={h.time} className={cls} onClick={() => onSelect(i)}>
            <div className="h-time">{label}</div>
            <div className="h-icon">{iconFor(h, hr)}</div>
            <div className="h-temp">{Math.round(h.tempC)}°</div>
            <div className="h-rain">{(h.rainProbabilityPct ?? 0) > 15 ? `${h.rainProbabilityPct}%` : ''}</div>
          </button>
        );
      })}
    </div>
  );
}
