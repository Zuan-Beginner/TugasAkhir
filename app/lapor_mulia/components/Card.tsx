'use client';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'report' | 'announce' | 'detail' | 'stat' | 'billing' | 'contact' | 'schedule';
  urgent?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export default function Card({ children, className = '', variant = 'default', urgent, onClick, style }: CardProps) {
  const baseClass = {
    default: 'card-default',
    report: 'report-card',
    announce: `announce-card ${urgent ? 'urgent' : ''}`,
    detail: 'detail-card',
    stat: 'stat-card',
    billing: 'billing-card',
    contact: 'contact-card',
    schedule: 'schedule-item',
  }[variant];

  return (
    <div
      className={`${baseClass} stagger-item ${className}`}
      onClick={onClick}
      style={{ ...style, cursor: onClick ? 'pointer' : undefined }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}
