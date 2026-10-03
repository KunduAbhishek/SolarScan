import type { MdSwitch } from '@material/web/switch/switch';
import { useId, useRef } from 'react';
import { useNativeEvent } from '../hooks/useNativeEvent';

export default function InputBool({
  label,
  value = false,
  onChange,
}: {
  label: string;
  value?: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  const ref = useRef<MdSwitch>(null);
  useNativeEvent(ref, 'click', () => onChange(ref.current!.selected));

  return (
    <label htmlFor={id} className="p-2 relative inline-flex items-center cursor-pointer">
      <md-switch id={id} ref={ref} selected={value} />
      <span className="ml-3 body-large">{label}</span>
    </label>
  );
}
