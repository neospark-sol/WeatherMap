import type { DailyPoint } from '../types';

export function DailyList({ days }: { days: DailyPoint[] }) {
  if (!days.length) return null;
  const minAll = Math.min(...days.map((d) => d.minC));
  const maxAll = Math.max(...days.map((d) => d.maxC));
  const span = maxAll - minAll || 1;
  return (
    <div>
      {days.map((d, i) => {
        const dt = new Date(d.date + 'T12:00:00');
        const name = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dt.toLocaleDateString('en-AU', { weekday: 'short' });
        const left = ((d.minC - minAll) / span) * 100;
        const right = 100 - ((d.maxC - minAll) / span) * 100;
        return (
          <div key={d.date} className="day-row">
            <div className="name">{name}</div>
            <div className="icon">{d.icon}</div>
            <div className="bar">
              <div className="fill" style={{ left: `${left}%`, right: `${right}%` }} />
            </div>
            <div className="temps">
              <span className="min">{d.minC}°</span>
              <span className="max">{d.maxC}°</span>
            </div>
            {(d.rainProbabilityPct ?? 0) > 15 && <div className="rainp">💧 {d.rainProbabilityPct}%</div>}
          </div>
        );
      })}
    </div>
  );
}
