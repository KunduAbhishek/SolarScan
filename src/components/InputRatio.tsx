import InputNumber from './InputNumber';

/** Edits a growth factor (like 1.022) as a percentage (2.2%), or a decline factor with `decrease`. */
export default function InputRatio({
  icon,
  label,
  value = 0,
  decrease = false,
  prefix,
  suffix = '%',
  onChange,
}: {
  icon: string;
  label: string;
  value?: number;
  decrease?: boolean;
  prefix?: string;
  suffix?: string;
  onChange: (x: number) => void;
}) {
  return (
    <InputNumber
      value={value}
      icon={icon}
      label={label}
      prefix={prefix}
      suffix={suffix}
      put={(x) =>
        ((decrease ? 1 - x : x - 1) * 100).toLocaleString(undefined, {
          maximumSignificantDigits: 2,
        })
      }
      get={(x) => (decrease ? 1 - x / 100 : x / 100 + 1)}
      onChange={onChange}
    />
  );
}
