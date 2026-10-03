import { panelsPalette } from './colors';
import type { SolarPotential } from './solar';
import { createPalette, normalize, rgbToColor } from './visualize';

/**
 * Creates a map polygon for every solar panel in the Solar API response.
 * The polygons are returned detached from the map; the caller decides which ones to show.
 * Panels come sorted from the highest to the lowest yearly energy production.
 */
export function buildPanelPolygons(
  solarPotential: SolarPotential,
  geometryLibrary: google.maps.GeometryLibrary,
): google.maps.Polygon[] {
  const panels = solarPotential.solarPanels;
  if (panels.length == 0) return [];

  const palette = createPalette(panelsPalette).map(rgbToColor);
  const minEnergy = panels.slice(-1)[0].yearlyEnergyDcKwh;
  const maxEnergy = panels[0].yearlyEnergyDcKwh;
  const [w, h] = [solarPotential.panelWidthMeters / 2, solarPotential.panelHeightMeters / 2];
  const points = [
    { x: +w, y: +h }, // top right
    { x: +w, y: -h }, // bottom right
    { x: -w, y: -h }, // bottom left
    { x: -w, y: +h }, // top left
    { x: +w, y: +h }, //  top right
  ];

  return panels.map((panel) => {
    const orientation = panel.orientation == 'PORTRAIT' ? 90 : 0;
    const azimuth = solarPotential.roofSegmentStats[panel.segmentIndex].azimuthDegrees;
    const colorIndex = Math.round(normalize(panel.yearlyEnergyDcKwh, maxEnergy, minEnergy) * 255);
    return new google.maps.Polygon({
      paths: points.map(({ x, y }) =>
        geometryLibrary.spherical.computeOffset(
          { lat: panel.center.latitude, lng: panel.center.longitude },
          Math.sqrt(x * x + y * y),
          Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth,
        ),
      ),
      strokeColor: '#B0BEC5',
      strokeOpacity: 0.9,
      strokeWeight: 1,
      fillColor: palette[colorIndex],
      fillOpacity: 0.9,
    });
  });
}
