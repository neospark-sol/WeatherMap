import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
} from 'chart.js';
import type { HourPoint } from '../types';

Chart.register(
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
);

type Metric = 'temp' | 'rain' | 'wind';

export function HourlyChart({
  hours,
  metric,
  range,
  selectedIdx: _selectedIdx,
  onSelect
}: {
  hours: HourPoint[];
  metric: Metric;
  range: number;
  selectedIdx: number;
  onSelect: (i: number) => void;
}) {
  void _selectedIdx;
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // keep selectedIdx out of main chart rebuild — only styling uses it via strip

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();

    const data = hours.slice(0, range);
    const styles = getComputedStyle(document.body);
    const accent = styles.getPropertyValue('--accent').trim() || '#6ea8ff';
    const accent2 = styles.getPropertyValue('--accent-2').trim() || '#8be3ff';
    const textDim = styles.getPropertyValue('--text-dim').trim();
    const border = styles.getPropertyValue('--border').trim();

    const labels = data.map((d) => {
      const t = new Date(d.time);
      const hr = t.getHours();
      return hr === 0 ? '12a' : hr === 12 ? '12p' : hr < 12 ? `${hr}a` : `${hr - 12}p`;
    });

    let datasets: object[] = [];
    let yTitle = '';
    if (metric === 'temp') {
      yTitle = '°C';
      datasets = [
        {
          type: 'line' as const,
          label: 'Temperature',
          data: data.map((d) => d.tempC),
          borderColor: accent,
          borderWidth: 2.4,
          tension: 0.4,
          fill: true,
          backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const c = ctx.chart.ctx;
            const g = c.createLinearGradient(0, 0, 0, 200);
            g.addColorStop(0, accent + '55');
            g.addColorStop(1, accent + '05');
            return g;
          },
          pointRadius: 0,
          pointHoverRadius: 5
        }
      ];
    } else if (metric === 'rain') {
      yTitle = 'mm';
      datasets = [
        {
          type: 'bar' as const,
          label: 'Rain',
          data: data.map((d) => d.precipMm ?? 0),
          backgroundColor: accent2 + 'cc',
          borderRadius: 4,
          borderSkipped: false
        }
      ];
    } else {
      yTitle = 'km/h';
      datasets = [
        {
          type: 'line' as const,
          label: 'Wind',
          data: data.map((d) => d.windKph ?? 0),
          borderColor: accent,
          borderWidth: 2.4,
          tension: 0.4,
          fill: true,
          backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const c = ctx.chart.ctx;
            const g = c.createLinearGradient(0, 0, 0, 200);
            g.addColorStop(0, accent + '55');
            g.addColorStop(1, accent + '05');
            return g;
          },
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          type: 'line' as const,
          label: 'Gusts',
          data: data.map((d) => d.windGustKph ?? 0),
          borderColor: accent,
          borderDash: [4, 3],
          borderWidth: 1.5,
          fill: false,
          tension: 0.4,
          pointRadius: 0
        }
      ];
    }

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: { labels, datasets: datasets as never },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (items) => labels[items[0].dataIndex],
              label: (item) =>
                `${item.dataset.label}: ${Math.round(Number(item.parsed.y) * 10) / 10}${yTitle}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: textDim,
              font: { size: 10 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8
            }
          },
          y: {
            grid: { color: border, drawTicks: false },
            border: { display: false },
            ticks: { color: textDim, font: { size: 10 } },
            beginAtZero: metric === 'rain'
          }
        },
        onClick: (_evt, elements) => {
          if (elements.length) onSelectRef.current(elements[0].index);
        }
      }
    });

    return () => chartRef.current?.destroy();
  }, [hours, metric, range]);

  return <canvas ref={ref} />;
}
