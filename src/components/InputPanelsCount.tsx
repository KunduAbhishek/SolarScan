import type { MdSlider } from '@material/web/slider/slider';
import { useRef } from 'react';
import { useNativeEvent } from '../hooks/useNativeEvent';
import type { SolarPanelConfig } from '../lib/solar';

export default function InputPanelsCount({
  configId,
  solarPanelConfigs,
  onChange,
}: {
  configId: number;
  solarPanelConfigs: SolarPanelConfig[];
  onChange: (configId: number) => void;
}) {
  const ref = useRef<MdSlider>(null);
  useNativeEvent(ref, 'change', () => onChange(ref.current!.value ?? 0));

  return (
    <div>
      <table className="table-auto w-full body-medium secondary-text">
        <tbody>
          <tr>
            <td className="primary-text">
              <md-icon>solar_power</md-icon>{' '}
            </td>
            <th className="pl-2 text-left">Panels count</th>
            <td className="pl-2 text-right">
              <span>{solarPanelConfigs[configId]?.panelsCount} panels</span>
            </td>
          </tr>
        </tbody>
      </table>

      <md-slider
        ref={ref}
        className="w-full"
        value={configId}
        min={0}
        max={solarPanelConfigs.length - 1}
      />
    </div>
  );
}
