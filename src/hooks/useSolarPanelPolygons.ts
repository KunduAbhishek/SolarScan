import { useEffect, useState } from 'react';
import { buildPanelPolygons } from '../lib/panels';
import type { BuildingInsightsResponse } from '../lib/solar';

/**
 * Draws the solar panels of a building on the map. Only the first `panelsCount` panels are
 * shown, and only when `show` is true. All polygons are removed from the map on cleanup.
 */
export function useSolarPanelPolygons(
  insights: BuildingInsightsResponse | undefined,
  geometryLibrary: google.maps.GeometryLibrary,
  map: google.maps.Map,
  show: boolean,
  panelsCount: number | undefined,
) {
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!insights) {
      setPolygons([]);
      return;
    }
    const created = buildPanelPolygons(insights.solarPotential, geometryLibrary);
    setPolygons(created);
    return () => created.forEach((polygon) => polygon.setMap(null));
  }, [insights, geometryLibrary]);

  useEffect(() => {
    polygons.forEach((polygon, i) =>
      polygon.setMap(show && panelsCount !== undefined && i < panelsCount ? map : null),
    );
  }, [polygons, show, panelsCount, map]);
}
