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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setAnimated(true);
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const getColorByIndex = (index: number) => {
    const lightColors = [
      { bg: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', color: '#1976D2', shadow: 'rgba(25, 118, 210, 0.2)' },
      { bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', color: '#F57C00', shadow: 'rgba(245, 124, 0, 0.2)' },
      { bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', color: '#388E3C', shadow: 'rgba(56, 142, 60, 0.2)' },
      { bg: 'linear-gradient(135deg, #FDF2F4 0%, #F8BBD0 100%)', color: '#C2185B', shadow: 'rgba(194, 24, 91, 0.2)' },
    ];
    const darkColors = [
      { bg: 'linear-gradient(135deg, #1A2744 0%, #1E3A5F 100%)', color: '#64B5F6', shadow: 'rgba(100, 181, 246, 0.15)' },
      { bg: 'linear-gradient(135deg, #3D2200 0%, #4A2800 100%)', color: '#FFB74D', shadow: 'rgba(255, 183, 77, 0.15)' },
      { bg: 'linear-gradient(135deg, #1A3320 0%, #2E4A2E 100%)', color: '#81C784', shadow: 'rgba(129, 199, 132, 0.15)' },
      { bg: 'linear-gradient(135deg, #3D1525 0%, #4A1A30 100%)', color: '#F48FB1', shadow: 'rgba(244, 143, 177, 0.15)' },
    ];
    const colors = isDark ? darkColors : lightColors;
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
