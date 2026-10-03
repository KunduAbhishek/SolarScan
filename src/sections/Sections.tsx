import { useSolar } from '../state/SolarContext';
import BuildingInsightsSection from './BuildingInsightsSection';
import DataLayersSection from './DataLayersSection';
import SolarPotentialSection from './SolarPotentialSection';

export default function Sections({
  location,
  map,
  geometryLibrary,
  googleMapsApiKey,
}: {
  location: google.maps.LatLng;
  map: google.maps.Map;
  geometryLibrary: google.maps.GeometryLibrary;
  googleMapsApiKey: string;
}) {
  const {
    state: { buildingInsights, configId },
  } = useSolar();

  return (
    <div className="flex flex-col rounded-md shadow-md">
      <BuildingInsightsSection
        googleMapsApiKey={googleMapsApiKey}
        geometryLibrary={geometryLibrary}
        location={location}
        map={map}
      />

      {buildingInsights && configId !== undefined && (
        <>
          <md-divider inset />
          <DataLayersSection
            googleMapsApiKey={googleMapsApiKey}
            buildingInsights={buildingInsights}
            geometryLibrary={geometryLibrary}
            map={map}
          />

          <md-divider inset />
          <SolarPotentialSection
            solarPanelConfigs={buildingInsights.solarPotential.solarPanelConfigs}
            defaultPanelCapacityWatts={buildingInsights.solarPotential.panelCapacityWatts}
          />
        </>
      )}
    </div>
  );
}
