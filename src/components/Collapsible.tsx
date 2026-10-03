import type { ReactNode } from 'react';

/**
 * Animates its content open and closed with a CSS grid-rows transition.
 * The content stays mounted while closed and is made `inert` so it can't be focused.
 */
export default function Collapsible({ open, children }: { open: boolean; children?: ReactNode }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-200"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      inert={!open}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  );
}
