import InputNumber from './InputNumber';

export default function InputPercent({
  icon,
  label,
  value = 0,
  prefix,
  suffix = '%',
  onChange,
}: {
  icon: string;
  label: string;
  value?: number;
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
      put={(x) => (x * 100).toLocaleString(undefined, { maximumSignificantDigits: 2 })}
      get={(x) => x / 100}
      onChange={onChange}
    />
  );
}
