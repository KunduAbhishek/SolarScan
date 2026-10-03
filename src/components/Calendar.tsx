import { useState } from 'react';
import Dropdown from './Dropdown';

const monthDays: Record<string, number> = {
  January: 31,
  February: 28,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
};

const months = Object.keys(monthDays);
const monthOptions = Object.fromEntries(months.map((month, i) => [i.toString(), month]));

export default function Calendar({
  month,
  day,
  numCols = 7,
  onChange,
}: {
  month: number;
  day: number;
  numCols?: number;
  onChange: (month: number, day: number) => void;
}) {
  const [opened, setOpened] = useState(false);

  const daysInMonth = monthDays[months[month]];
  const dayFrom = (row: number, col: number) => row * numCols + col + 1;

  return (
    <div className="relative">
      <md-text-button className="w-full" trailing-icon onClick={() => setOpened(!opened)}>
        <div className="flex items-center">
          <md-icon>event</md-icon>
          <span>
            &nbsp; {months[month]} {day}
          </span>
        </div>
      </md-text-button>

      {opened && (
        <>
          <div className="fixed top-0 left-0 w-full h-full z-10" onClick={() => setOpened(false)} />

          <div className="surface-variant on-surface-variant-text absolute right-4 w-auto p-4 rounded-lg shadow-lg z-20">
            <div className="px-4 pb-4">
              <Dropdown
                value={month.toString()}
                options={monthOptions}
                onChange={(value) => {
                  const newMonth = Number(value);
                  // Keep the day valid in months that are shorter than the previous one.
                  onChange(newMonth, Math.min(day, monthDays[months[newMonth]]));
                }}
              />
            </div>

            <table>
              <tbody>
                {[...Array(Math.ceil(daysInMonth / numCols)).keys()].map((row) => (
                  <tr key={row}>
                    {[...Array(numCols).keys()].map((col) => {
                      const d = dayFrom(row, col);
                      return (
                        <td key={col}>
                          {d == day ? (
                            <button
                              className="primary on-primary-text relative w-8 h-8 rounded-full"
                              onClick={() => setOpened(false)}
                            >
                              <md-ripple />
                              {d}
                            </button>
                          ) : d <= daysInMonth ? (
                            <button
                              className="relative w-8 h-8 rounded-full"
                              onClick={() => {
                                setOpened(false);
                                onChange(month, d);
                              }}
                            >
                              <md-ripple />
                              {d}
                            </button>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
