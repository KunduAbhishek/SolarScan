import { useCallback, useEffect, useState } from 'react';
import {
  findClosestBuilding,
  toRequestError,
  type BuildingInsightsResponse,
  type RequestError,
} from '../lib/solar';

interface Result {
  insights?: BuildingInsightsResponse;
  error?: RequestError;
}

/** Fetches the building insights for a location, discarding stale responses. */
export function useBuildingInsights(location: google.maps.LatLng, apiKey: string) {
  const [result, setResult] = useState<Result>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setResult({});
    findClosestBuilding(location, apiKey)
      .then((insights) => !ignore && setResult({ insights }))
      .catch((e) => !ignore && setResult({ error: toRequestError(e) }));
    return () => {
      ignore = true;
    };
  }, [location, apiKey, attempt]);

  const retry = useCallback(() => setAttempt((x) => x + 1), []);
  return { ...result, retry };
}
