'use client';

type EmptyStateProps = {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state stagger-item">
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 13, marginBottom: 12 }}>{description}</div>}
      {action && (
        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
