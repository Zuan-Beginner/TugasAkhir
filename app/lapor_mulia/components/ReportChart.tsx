'use client';

import { useMemo } from 'react';
import type { Report } from '../lib/types';
import { categories, getStatusColor } from '../lib/constants';

type ReportChartProps = {
  reports: Report[];
};

export default function ReportChart({ reports }: ReportChartProps) {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return categories
      .map((c) => ({ name: c.name, count: counts[c.name] || 0, color: c.color, icon: c.icon }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { Terkirim: 0, Diproses: 0, Selesai: 0, Ditolak: 0 };
    reports.forEach((r) => { counts[r.status]++; });
    return [
      { name: 'Terkirim', count: counts.Terkirim, color: '#1E88E5', icon: '📨' },
      { name: 'Diproses', count: counts.Diproses, color: '#FF9800', icon: '⏳' },
      { name: 'Selesai', count: counts.Selesai, color: '#4CAF50', icon: '✅' },
      { name: 'Ditolak', count: counts.Ditolak, color: '#E53935', icon: '❌' },
    ];
  }, [reports]);

  const maxCount = useMemo(() => {
    return Math.max(...categoryData.map((c) => c.count), 1);
  }, [categoryData]);

  const totalForPie = useMemo(() => statusData.reduce((s, d) => s + d.count, 0), [statusData]);

  if (reports.length === 0) return null;

  return (
    <section className="section">
      <div className="section-header"><h3>Statistik Laporan</h3></div>
      <div className="chart-grid">
        {/* Bar Chart - Per Kategori */}
        <div className="chart-container">
          <div className="chart-title">Per Kategori</div>
          <div className="chart-bar-list">
            {categoryData.map((cat) => (
              <div key={cat.name} className="chart-bar-item">
                <div className="chart-bar-label">
                  <span>{cat.icon} {cat.name}</span>
                  <span className="chart-bar-value">{cat.count}</span>
                </div>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${(cat.count / maxCount) * 100}%`,
                      background: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart - Per Status */}
        <div className="chart-container">
          <div className="chart-title">Per Status</div>
          <div className="chart-donut-wrapper">
            <svg viewBox="0 0 36 36" className="chart-donut">
              {(() => {
                let cumulativePercent = 0;
                const segments: React.ReactNode[] = [];
                statusData.forEach((d) => {
                  if (d.count === 0) return;
                  const percent = (d.count / totalForPie) * 100;
                  const dashArray = `${percent} ${100 - percent}`;
                  const dashOffset = 100 - cumulativePercent + 25;
                  segments.push(
                    <circle
                      key={d.name}
                      cx="18" cy="18" r="15.9155"
                      fill="none"
                      stroke={d.color}
                      strokeWidth="3.5"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="chart-donut-segment"
                    />
                  );
                  cumulativePercent += percent;
                });
                return segments;
              })()}
            </svg>
            <div className="chart-donut-center">
              <div className="chart-donut-total">{totalForPie}</div>
              <div className="chart-donut-label">Total</div>
            </div>
          </div>
          <div className="chart-legend">
            {statusData.map((d) => (
              <div key={d.name} className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: d.color }} />
                <span className="chart-legend-label">{d.icon} {d.name}</span>
                <span className="chart-legend-value">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
