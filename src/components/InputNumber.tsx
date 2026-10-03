import type { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';
import { useRef } from 'react';
import { useNativeEvent } from '../hooks/useNativeEvent';

export interface InputNumberProps {
  icon: string;
  label: string;
  value?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  /** Formats the value for display. */
  put?: (x: number) => string;
  /** Converts the displayed number back into the value. */
  get?: (x: number) => number;
  onChange: (x: number) => void;
}

export default function InputNumber({
  icon,
  label,
  value = 0,
  min,
  max,
  prefix,
  suffix,
  put = (x) => x.toString(),
  get = (x) => x,
  onChange,
}: InputNumberProps) {
  const ref = useRef<MdOutlinedTextField>(null);
  useNativeEvent(ref, 'change', () => onChange(get(Number(ref.current!.value))));

  return (
    <md-outlined-text-field
      ref={ref}
      type="number"
      label={label}
      value={put(value)}
      min={min}
      max={max}
      prefix-text={prefix}
      suffix-text={suffix}
    >
      <md-icon slot="leading-icon">{icon}</md-icon>
    </md-outlined-text-field>
  );
}
