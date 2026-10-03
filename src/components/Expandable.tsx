import type { ReactNode } from 'react';
import Collapsible from './Collapsible';

/** Accordion header with collapsible content. */
export default function Expandable({
  title,
  subtitle = '',
  subtitle2 = '',
  icon = '',
  expanded = false,
  onToggle,
  secondary = false,
  children,
}: {
  title: string;
  subtitle?: string;
  subtitle2?: string;
  icon?: string;
  expanded?: boolean;
  onToggle: () => void;
  secondary?: boolean;
  children?: ReactNode;
}) {
  const titleText = secondary ? 'secondary-text' : 'primary-text';

  return (
    <>
      <button className="flex flex-row w-full p-4" onClick={onToggle}>
        <md-icon className={`${titleText} w-12`}>{icon}</md-icon>
        <div className="w-full grid justify-items-start text-left">
          <p className={`${titleText} body-large`}>
            <b>{title}</b>
          </p>
          <p className="label-medium outline-text">{subtitle}</p>
          <p className="label-medium outline-text">{subtitle2}</p>
        </div>
        <md-icon-button>
          <md-icon>{expanded ? 'expand_less' : 'expand_more'}</md-icon>
        </md-icon-button>
      </button>

      <Collapsible open={expanded}>
        <div className="px-4 pb-6">{children}</div>
      </Collapsible>
    </>
  );
}
