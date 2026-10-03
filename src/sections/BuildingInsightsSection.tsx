import { useEffect } from 'react';
import ApiResponseDialog from '../components/ApiResponseDialog';
import Expandable from '../components/Expandable';
import Gauge from '../components/Gauge';
import InputBool from '../components/InputBool';
import InputNumber from '../components/InputNumber';
import InputPanelsCount from '../components/InputPanelsCount';
import RequestErrorCard from '../components/RequestErrorCard';
import SummaryCard from '../components/SummaryCard';
import { useBuildingInsights } from '../hooks/useBuildingInsights';
import { useSolarPanelPolygons } from '../hooks/useSolarPanelPolygons';
import { showNumber } from '../lib/utils';
import { useSolar } from '../state/SolarContext';

const icon = 'home';
const title = 'Building Insights endpoint';

export default function BuildingInsightsSection({
  googleMapsApiKey,
  geometryLibrary,
  location,
  map,
}: {
  googleMapsApiKey: string;
  geometryLibrary: google.maps.GeometryLibrary;
  location: google.maps.LatLng;
  map: google.maps.Map;
}) {
  const { state, dispatch } = useSolar();
  const { buildingInsights, configId, expandedSection, showPanels, inputs } = state;

  // Fetch the building every time the location changes, and share it with the other sections.
  const { insights, error, retry } = useBuildingInsights(location, googleMapsApiKey);
  useEffect(() => {
    if (insights) {
      dispatch({ type: 'buildingLoaded', insights });
    } else {
      dispatch({ type: 'buildingCleared' });
    }
  }, [insights, dispatch]);

  const solarPotential = buildingInsights?.solarPotential;
  const panelConfig =
    configId !== undefined ? solarPotential?.solarPanelConfigs[configId] : undefined;
  const panelCapacityRatio = solarPotential
    ? inputs.panelCapacityWatts / solarPotential.panelCapacityWatts
    : 1.0;

  useSolarPanelPolygons(
    buildingInsights,
    geometryLibrary,
    map,
    showPanels,
    panelConfig?.panelsCount,
  );

  if (error) {
    return (
      <RequestErrorCard title={title} endpoint="buildingInsights" error={error} onRetry={retry} />
    );
  }

  if (!buildingInsights || !solarPotential || configId === undefined || !panelConfig) {
    return (
      <div className="grid py-8 place-items-center">
        <md-circular-progress four-color indeterminate />
      </div>
    );
  }

  return (
    <>
      <Expandable
        icon={icon}
        title={title}
        subtitle={`Yearly energy: ${((panelConfig.yearlyEnergyDcKwh * panelCapacityRatio) / 1000).toFixed(2)} MWh`}
        expanded={expandedSection == title}
        onToggle={() => dispatch({ type: 'toggleSection', section: title })}
      >
        <div className="flex flex-col space-y-2 px-2">
          <span className="outline-text label-medium">
            <b>{title}</b> provides data on the location, dimensions & solar potential of a
            building.
          </span>

          <InputPanelsCount
            configId={configId}
            solarPanelConfigs={solarPotential.solarPanelConfigs}
            onChange={(configId) => dispatch({ type: 'setConfigId', configId })}
          />
          <InputNumber
            value={inputs.panelCapacityWatts}
            icon="bolt"
            label="Panel capacity"
            suffix="Watts"
            onChange={(panelCapacityWatts) =>
              dispatch({ type: 'setInputs', patch: { panelCapacityWatts } })
            }
          />
          <InputBool
            value={showPanels}
            label="Solar panels"
            onChange={(value) => dispatch({ type: 'setShowPanels', value })}
          />

          <ApiResponseDialog
            icon={icon}
            title={title}
            label="buildingInsightsResponse"
            value={buildingInsights}
          />
        </div>
      </Expandable>

      {expandedSection == title && (
        <div className="absolute top-0 left-0 w-72">
          <div className="flex flex-col space-y-2 m-2">
            <SummaryCard
              icon={icon}
              title={title}
              rows={[
                {
                  icon: 'wb_sunny',
                  name: 'Annual sunshine',
                  value: showNumber(solarPotential.maxSunshineHoursPerYear),
                  units: 'hr',
                },
                {
                  icon: 'square_foot',
                  name: 'Roof area',
                  value: showNumber(solarPotential.wholeRoofStats.areaMeters2),
                  units: 'm²',
                },
                {
                  icon: 'solar_power',
                  name: 'Max panel count',
                  value: showNumber(solarPotential.solarPanels.length),
                  units: 'panels',
                },
                {
                  icon: 'co2',
                  name: 'CO₂ savings',
                  value: showNumber(solarPotential.carbonOffsetFactorKgPerMwh),
                  units: 'Kg/MWh',
                },
              ]}
            />

            <div className="p-4 w-full surface on-surface-text rounded-lg shadow-md">
              <div className="flex justify-around">
                <Gauge
                  icon="solar_power"
                  title="Panels count"
                  label={showNumber(panelConfig.panelsCount)}
                  labelSuffix={`/ ${showNumber(solarPotential.solarPanels.length)}`}
                  max={solarPotential.solarPanels.length}
                  value={panelConfig.panelsCount}
                />

                <Gauge
                  icon="energy_savings_leaf"
                  title="Yearly energy"
                  label={showNumber(panelConfig.yearlyEnergyDcKwh * panelCapacityRatio)}
                  labelSuffix="KWh"
                  max={
                    solarPotential.solarPanelConfigs.slice(-1)[0].yearlyEnergyDcKwh *
                    panelCapacityRatio
                  }
                  value={panelConfig.yearlyEnergyDcKwh * panelCapacityRatio}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
