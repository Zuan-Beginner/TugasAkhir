'use client';

type TimelineStep = {
  label: string;
  status: 'done' | 'active' | 'pending';
};

type TimelineProps = {
  steps: TimelineStep[];
};

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div className="timeline">
      {steps.map((step, i) => (
        <div key={step.label} className="timeline-step">
          <div className={`timeline-dot ${step.status === 'done' ? 'done' : step.status === 'active' ? 'active' : ''}`}>
            {step.status === 'done' ? '✓' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`timeline-line ${step.status === 'done' ? 'done' : step.status === 'active' ? 'active' : ''}`} />
          )}
          <div className="timeline-label">{step.label}</div>
        </div>
      ))}
    </div>
  );
}
