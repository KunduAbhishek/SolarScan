import type { CSSProperties } from 'react';

export default function Gauge({
  icon,
  title,
  label,
  value,
  labelSuffix = '',
  min = 0.0,
  max = 1.0,
}: {
  icon: string;
  title: string;
  label: string;
  value: number;
  labelSuffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="grid place-items-center">
      <p className="p-2 body-large">{title}</p>
      <div className="relative" style={{ width: 72, height: 72 }}>
        <md-circular-progress
          value={value}
          min={min}
          max={max}
          style={{ '--md-circular-progress-size': '72px' } as CSSProperties}
        />
        <md-icon-button className="absolute inset-0 m-auto">
          <md-icon className="primary-text">{icon}</md-icon>
        </md-icon-button>
      </div>
      <p className="p-2 body-medium">
        <span className="primary-text">
          <b>{label}</b>
        </span>{' '}
        <span>{labelSuffix}</span>
      </p>
    </div>
  );
}
