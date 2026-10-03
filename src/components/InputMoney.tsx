import InputNumber from './InputNumber';

export default function InputMoney({
  icon,
  label,
  value = 0,
  prefix = '$',
  suffix,
  precision = 2,
  onChange,
}: {
  icon: string;
  label: string;
  value?: number;
  prefix?: string;
  suffix?: string;
  precision?: number;
  onChange: (x: number) => void;
}) {
  return (
    <InputNumber
      value={value}
      min={0}
      icon={icon}
      label={label}
      suffix={suffix}
      prefix={prefix}
      put={(x) => x.toFixed(precision)}
      onChange={onChange}
    />
  );
}
