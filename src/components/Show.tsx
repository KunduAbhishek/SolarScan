/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';

/** Recursive, collapsible JSON viewer. */
export default function Show({
  itemKey,
  value,
  maxLength = 40,
  label = '',
  collapsed = false,
}: {
  itemKey?: any;
  value: any;
  maxLength?: number;
  label?: string;
  collapsed?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const summary = useMemo(() => {
    const text: string | undefined = JSON.stringify(value);
    return text && text.length >= maxLength ? text.substring(0, maxLength) + '...' : text;
  }, [value, maxLength]);

  let items: { k: any; v: any }[] | undefined;
  if (Array.isArray(value)) {
    items = value.map((v, i) => ({ k: i, v: v }));
  } else if (typeof value === 'object' && value !== null) {
    items = Object.keys(value).map((k) => ({ k: k, v: value[k] }));
  }

  return (
    <div className="flex flex-col font-mono whitespace-nowrap">
      <div className="flex flex-row w-full">
        {collapsed && items !== undefined ? (
          <button onClick={() => setExpanded(!expanded)}>
            <md-icon>{expanded ? 'arrow_drop_down' : 'arrow_right'}</md-icon>
          </button>
        ) : (
          <div>
            <md-icon>&nbsp;</md-icon>
          </div>
        )}

        {itemKey !== undefined && <span className="font-bold">{itemKey}:&nbsp;</span>}

        {label ? (
          <span>{label}</span>
        ) : ['number', 'string', 'boolean', 'undefined'].includes(typeof value) ||
          value === null ? (
          <span>{String(value)}</span>
        ) : Array.isArray(value) ? (
          <span className="font-sans italic">
            ({value.length}) {summary}
          </span>
        ) : (
          <span className="font-sans italic">{summary}</span>
        )}
      </div>

      {(!collapsed || expanded) && (
        <div className="flex flex-col ml-8 pb-6 max-h-72 overflow-auto">
          {Array.isArray(value) && <span className="italic">length: {value.length}</span>}
          <div
            style={
              collapsed
                ? { borderLeft: 'solid', borderColor: 'var(--md-sys-color-outline-variant)' }
                : undefined
            }
          >
            {(items ?? []).map(({ k, v }) => (
              <Show key={k} itemKey={k} value={v} collapsed={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
