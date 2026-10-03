import type { ReactNode } from 'react';
import Table, { type TableRow } from './Table';

export default function SummaryCard({
  title = '',
  icon = '',
  rows = [],
  children,
}: {
  title?: string;
  icon?: string;
  rows?: TableRow[];
  children?: ReactNode;
}) {
  return (
    <div className="grid justify-items-start surface on-surface-text p-4 rounded-lg shadow-lg">
      <div className="flex items-center primary-text">
        <md-icon className="w-8">{icon}</md-icon>
        <p className="body-large">
          <b>{title}</b>
        </p>
      </div>
      <div className="py-3 w-full">
        <md-divider />
      </div>
      <div className="w-full secondary-text">
        <Table rows={rows} />
      </div>
      <div className="px-3">{children}</div>
    </div>
  );
}
