import { useState } from 'react';

export default function Dropdown({
  options,
  value,
  expandTop = false,
  onChange,
}: {
  options: Record<string, string>;
  value: string;
  expandTop?: boolean;
  onChange: (value: string) => void;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <div className="relative">
      <md-outlined-button className="w-full" trailing-icon onClick={() => setOpened(!opened)}>
        <div className="flex items-center">
          {value !== undefined ? options[value] : 'Choose an option'}
          <md-icon slot="icon">{opened ? 'expand_less' : 'expand_more'}</md-icon>
        </div>
      </md-outlined-button>

      {opened && (
        <>
          <div className="fixed top-0 left-0 w-full h-full z-10" onClick={() => setOpened(false)} />

          <div
            className={`surface-variant on-surface-variant-text absolute ${
              expandTop ? 'bottom-full' : ''
            } w-full p-2 rounded-lg shadow-xl z-20`}
          >
            {Object.keys(options).map((option) => (
              <button
                key={option}
                className="dropdown-item block px-4 py-2 w-full text-left rounded"
                onClick={() => {
                  setOpened(false);
                  onChange(option);
                }}
              >
                {options[option]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
