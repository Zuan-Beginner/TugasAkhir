'use client';

import { useState, useEffect } from 'react';

type StatItem = {
  icon: string;
  num: number;
  label: string;
};

type StatGridProps = {
  items: StatItem[];
};

export default function StatGrid({ items }: StatGridProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const getColorByIndex = (index: number) => {
    const colors = [
      { bg: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', color: '#1976D2', shadow: 'rgba(25, 118, 210, 0.2)' },
      { bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', color: '#F57C00', shadow: 'rgba(245, 124, 0, 0.2)' },
      { bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', color: '#388E3C', shadow: 'rgba(56, 142, 60, 0.2)' },
      { bg: 'linear-gradient(135deg, #FDF2F4 0%, #F8BBD0 100%)', color: '#C2185B', shadow: 'rgba(194, 24, 91, 0.2)' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="stats-grid">
      {items.map((item, i) => {
        const colors = getColorByIndex(i);
        return (
          <div 
            key={i} 
            className="stat-card-modern"
            style={{
              background: colors.bg,
              animationDelay: `${i * 0.1}s`,
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`
            }}
          >
            <div className="stat-icon-modern" style={{ color: colors.color }}>
              {item.icon}
            </div>
            <div className="stat-content">
              <div className="stat-num-modern" style={{ color: colors.color }}>
                {item.num}
              </div>
              <div className="stat-label-modern">{item.label}</div>
            </div>
            <div className="stat-decoration" style={{ background: colors.color, opacity: 0.1 }} />
          </div>
        );
      })}
    </div>
  );
}
