import type { MdSlider } from '@material/web/slider/slider';
import { useEffect, useRef, useState } from 'react';
import ApiResponseDialog from '../components/ApiResponseDialog';
import Calendar from '../components/Calendar';
import Dropdown from '../components/Dropdown';
import Expandable from '../components/Expandable';
import InputBool from '../components/InputBool';
import RequestErrorCard from '../components/RequestErrorCard';
import SummaryCard from '../components/SummaryCard';
import { useAnimationTick } from '../hooks/useAnimationTick';
import { useNativeEvent } from '../hooks/useNativeEvent';
import { getLayer, type Layer } from '../lib/layer';
import {
  getDataLayerUrls,
  toRequestError,
  type BuildingInsightsResponse,
  type DataLayersResponse,
  type LayerId,
  type RequestError,
} from '../lib/solar';
import { useSolar } from '../state/SolarContext';

const icon = 'layers';
const title = 'Data Layers endpoint';

type LayerChoice = LayerId | 'none';

const dataLayerOptions: Record<LayerChoice, string> = {
  none: 'No layer',
  mask: 'Roof mask',
  dsm: 'Digital Surface Model',
  rgb: 'Aerial image',
  annualFlux: 'Annual sunshine',
  monthlyFlux: 'Monthly sunshine',
  hourlyShade: 'Hourly shade',
};

const layerDescriptions: Record<LayerId, string> = {
  mask: 'The building mask image: one bit per pixel saying whether that pixel is considered to be part of a rooftop or not.',
  dsm: "An image of the DSM (Digital Surface Model) of the region. Values are in meters above EGM96 geoid (i.e., sea level). Invalid locations (where we don't have data) are stored as -9999.",
  rgb: 'An image of RGB data (aerial photo) of the region.',
  annualFlux:
    'The annual flux map (annual sunlight on roofs) of the region. Values are kWh/kW/year. This is unmasked flux: flux is computed for every location, not just building rooftops. Invalid locations are stored as -9999: locations outside our coverage area will be invalid, and a few locations inside the coverage area, where we were unable to calculate flux, will also be invalid.',
  monthlyFlux:
    'The monthly flux map (sunlight on roofs, broken down by month) of the region. Values are kWh/kW/year. The GeoTIFF imagery file pointed to by this URL will contain twelve bands, corresponding to January...December, in order.',
  hourlyShade:
    'Twelve URLs for hourly shade, corresponding to January...December, in order. Each GeoTIFF imagery file will contain 24 bands, corresponding to the 24 hours of the day. Each pixel is a 32 bit integer, corresponding to the (up to) 31 days of that month; a 1 bit means that the corresponding location is able to see the sun at that day, of that hour, of that month. Invalid locations are stored as -9999 (since this is negative, it has bit 31 set, and no valid value could have bit 31 set as that would correspond to the 32nd day of the month).',
};

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Default settings every time a layer is selected. */
function defaultsFor(layerId: LayerChoice) {
  return {
    showRoofOnly: ['annualFlux', 'monthlyFlux', 'hourlyShade'].includes(layerId),
    month: layerId == 'hourlyShade' ? 3 : 0,
    day: 14,
    hour: 5,
    playAnimation: ['monthlyFlux', 'hourlyShade'].includes(layerId),
  };
}

function formatHour(hour: number) {
  if (hour == 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour == 12) return '12pm';
  return `${hour - 12}pm`;
}

/** A range slider with both handles at the same position, so it works like a normal slider. */
function IndexSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const ref = useRef<MdSlider>(null);
  useNativeEvent(ref, 'input', () => {
    const slider = ref.current!;
    if (slider.valueStart != value) {
      onChange(slider.valueStart ?? 0);
    } else if (slider.valueEnd != value) {
      onChange(slider.valueEnd ?? 0);
    }
  });
  return <md-slider ref={ref} range min={min} max={max} valueStart={value} valueEnd={value} />;
}

export default function DataLayersSection({
  googleMapsApiKey,
  buildingInsights,
  geometryLibrary,
  map,
}: {
  googleMapsApiKey: string;
  buildingInsights: BuildingInsightsResponse;
  geometryLibrary: google.maps.GeometryLibrary;
  map: google.maps.Map;
}) {
  const { state, dispatch } = useSolar();
  const { expandedSection, showPanels } = state;

  const [layerId, setLayerId] = useState<LayerChoice>('monthlyFlux');
  const [layer, setLayer] = useState<Layer>();
  const [dataLayersResponse, setDataLayersResponse] = useState<DataLayersResponse>();
  const [requestError, setRequestError] = useState<RequestError>();
  const [attempt, setAttempt] = useState(0);

  const defaults = defaultsFor('monthlyFlux');
  const [showRoofOnly, setShowRoofOnly] = useState(defaults.showRoofOnly);
  const [playAnimation, setPlayAnimation] = useState(defaults.playAnimation);
  const [month, setMonth] = useState(defaults.month);
  const [day, setDay] = useState(defaults.day);
  const [hour, setHour] = useState(defaults.hour);

  const [overlays, setOverlays] = useState<google.maps.GroundOverlay[]>([]);
  // The data layer URLs only depend on the building, so they are shared between layers.
  const urlsCache = useRef<{ insights: BuildingInsightsResponse; response: DataLayersResponse }>(
    undefined,
  );

  function selectLayer(newLayerId: LayerChoice) {
    const defaults = defaultsFor(newLayerId);
    setLayerId(newLayerId);
    setShowRoofOnly(defaults.showRoofOnly);
    setPlayAnimation(defaults.playAnimation);
    setMonth(defaults.month);
    setDay(defaults.day);
    setHour(defaults.hour);
  }

  // The aerial image is easier to read on top of the roadmap.
  useEffect(() => {
    map.setMapTypeId(layerId == 'rgb' ? 'roadmap' : 'satellite');
  }, [map, layerId]);

  // Download the selected layer.
  useEffect(() => {
    setLayer(undefined);
    setRequestError(undefined);
    if (layerId == 'none') return;

    let ignore = false;
    (async () => {
      try {
        let response =
          urlsCache.current?.insights === buildingInsights ? urlsCache.current.response : undefined;
        if (!response) {
          const { center, boundingBox } = buildingInsights;
          const diameter = geometryLibrary.spherical.computeDistanceBetween(
            new google.maps.LatLng(boundingBox.ne.latitude, boundingBox.ne.longitude),
            new google.maps.LatLng(boundingBox.sw.latitude, boundingBox.sw.longitude),
          );
          response = await getDataLayerUrls(center, Math.ceil(diameter / 2), googleMapsApiKey);
          urlsCache.current = { insights: buildingInsights, response };
        }
        if (ignore) return;
        setDataLayersResponse(response);

        const newLayer = await getLayer(layerId, response, googleMapsApiKey);
        if (!ignore) setLayer(newLayer);
      } catch (e) {
        if (!ignore) setRequestError(toRequestError(e));
      }
    })();
    return () => {
      ignore = true;
    };
  }, [buildingInsights, layerId, attempt, googleMapsApiKey, geometryLibrary]);

  // Render the layer into overlays. Only the hourly shade depends on the month and day.
  const renderMonth = layer?.id == 'hourlyShade' ? month : 0;
  const renderDay = layer?.id == 'hourlyShade' ? day : 0;
  useEffect(() => {
    if (!layer) {
      setOverlays([]);
      return;
    }
    console.log('Render layer:', {
      layerId: layer.id,
      showRoofOnly,
      month: renderMonth,
      day: renderDay,
    });
    const created = layer
      .render(showRoofOnly, renderMonth, renderDay)
      .map((canvas) => new google.maps.GroundOverlay(canvas.toDataURL(), layer.bounds));
    setOverlays(created);
    return () => created.forEach((overlay) => overlay.setMap(null));
  }, [layer, showRoofOnly, renderMonth, renderDay]);

  // Only show the overlay of the current month or hour.
  useEffect(() => {
    overlays.forEach((overlay, i) => {
      const visible =
        layer?.id == 'monthlyFlux' ? i == month : layer?.id == 'hourlyShade' ? i == hour : i == 0;
      overlay.setMap(visible ? map : null);
    });
  }, [overlays, layer?.id, month, hour, map]);

  // Animate the monthly and hourly layers.
  useAnimationTick(
    playAnimation && (layer?.id == 'monthlyFlux' || layer?.id == 'hourlyShade'),
    () => {
      if (layer?.id == 'monthlyFlux') setMonth((x) => (x + 1) % 12);
      if (layer?.id == 'hourlyShade') setHour((x) => (x + 1) % 24);
    },
  );

  const imageryQuality = dataLayersResponse?.imageryQuality;
  const expanded = expandedSection == title;

  return (
    <>
      {requestError ? (
        <RequestErrorCard
          title={title}
          endpoint="dataLayers"
          detail={layerId}
          error={requestError}
          onRetry={() => setAttempt((x) => x + 1)}
        />
      ) : (
        <Expandable
          icon={icon}
          title={title}
          subtitle={dataLayerOptions[layerId]}
          expanded={expanded}
          onToggle={() => dispatch({ type: 'toggleSection', section: title })}
        >
          <div className="flex flex-col space-y-2 px-2">
            <span className="outline-text label-medium">
              <b>{title}</b> provides raw and processed imagery and granular details on an area
              surrounding a location.
            </span>

            <Dropdown
              value={layerId}
              options={dataLayerOptions}
              onChange={(value) => selectLayer(value as LayerChoice)}
            />

            {layerId == 'none' ? (
              <div />
            ) : !layer ? (
              <md-linear-progress four-color indeterminate />
            ) : (
              <>
                {layer.id == 'hourlyShade' && (
                  <Calendar
                    month={month}
                    day={day}
                    onChange={(newMonth, newDay) => {
                      setMonth(newMonth);
                      setDay(newDay);
                    }}
                  />
                )}

                <span className="outline-text label-medium">
                  {imageryQuality == 'HIGH' ? (
                    <>
                      <p>
                        <b>Low altitude aerial imagery</b> available.
                      </p>
                      <p>
                        Imagery and DSM data were processed at <b>10 cm/pixel</b>.
                      </p>
                    </>
                  ) : imageryQuality == 'MEDIUM' ? (
                    <>
                      <p>
                        <b>AI augmented aerial imagery</b> available.
                      </p>
                      <p>
                        Imagery and DSM data were processed at <b>25 cm/pixel</b>.
                      </p>
                    </>
                  ) : imageryQuality == 'BASE' ? (
                    <>
                      <p>
                        <b>AI augmented satellite imagery</b> available.
                      </p>
                      <p>
                        Imagery and DSM data were processed at <b>25 cm/pixel</b>.
                      </p>
                    </>
                  ) : null}
                </span>

                <InputBool
                  value={showPanels}
                  label="Solar panels"
                  onChange={(value) => dispatch({ type: 'setShowPanels', value })}
                />
                <InputBool value={showRoofOnly} label="Roof only" onChange={setShowRoofOnly} />

                {['monthlyFlux', 'hourlyShade'].includes(layerId) && (
                  <InputBool
                    value={playAnimation}
                    label="Play animation"
                    onChange={setPlayAnimation}
                  />
                )}
              </>
            )}

            <ApiResponseDialog
              icon={icon}
              title={title}
              label="dataLayersResponse"
              value={dataLayersResponse}
            />
          </div>
        </Expandable>
      )}

      <div className="absolute top-0 left-0 w-72">
        {expanded && layer && (
          <div className="m-2">
            <SummaryCard
              icon={icon}
              title={title}
              rows={[{ name: dataLayerOptions[layerId], value: '' }]}
            >
              <div className="flex flex-col space-y-4">
                <p className="outline-text">{layerDescriptions[layer.id]}</p>

                {layer.palette && (
                  <div>
                    <div
                      className="h-2 outline rounded-sm"
                      style={{
                        background: `linear-gradient(to right, ${layer.palette.colors.map(
                          (hex) => '#' + hex,
                        )})`,
                      }}
                    />
                    <div className="flex justify-between pt-1 label-small">
                      <span>{layer.palette.min}</span>
                      <span>{layer.palette.max}</span>
                    </div>
                  </div>
                )}
              </div>
            </SummaryCard>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-0 w-full">
        <div className="md:mr-96 mr-80 grid place-items-center">
          {layer && (layer.id == 'monthlyFlux' || layer.id == 'hourlyShade') && (
            <div className="flex items-center surface on-surface-text pr-4 text-center label-large rounded-full shadow-md">
              {layer.id == 'monthlyFlux' ? (
                <>
                  <IndexSlider min={0} max={11} value={month} onChange={setMonth} />
                  <span className="w-8">{monthNames[month]}</span>
                </>
              ) : (
                <>
                  <IndexSlider min={0} max={23} value={hour} onChange={setHour} />
                  <span className="w-24 whitespace-nowrap">
                    {monthNames[month]} {day}, {formatHour(hour)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
