import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useState, type RefObject } from 'react';

export interface GoogleMaps {
  map: google.maps.Map;
  geometryLibrary: google.maps.GeometryLibrary;
  placesLibrary: google.maps.PlacesLibrary;
  /** Geocoded location of the default address. */
  initialLocation: google.maps.LatLng;
}

// The loader must only be created once, even if the effect runs twice (StrictMode).
let loader: Loader | undefined;
function getLoader(apiKey: string) {
  loader ??= new Loader({ apiKey });
  return loader;
}

/**
 * Loads the Google Maps libraries, geocodes `address` and creates a satellite map
 * centered on it inside `mapElement`.
 */
export function useGoogleMaps(
  mapElement: RefObject<HTMLElement | null>,
  apiKey: string,
  address: string,
  zoom: number,
): GoogleMaps | undefined {
  const [maps, setMaps] = useState<GoogleMaps>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loader = getLoader(apiKey);
      const [geometryLibrary, mapsLibrary, placesLibrary] = await Promise.all([
        loader.importLibrary('geometry'),
        loader.importLibrary('maps'),
        loader.importLibrary('places'),
      ]);

      // Get the address information for the default location.
      const geocoder = new google.maps.Geocoder();
      const geocoderResponse = await geocoder.geocode({ address });
      if (cancelled || !mapElement.current) return;
      const initialLocation = geocoderResponse.results[0].geometry.location;

      // Initialize the map at the desired location.
      const map = new mapsLibrary.Map(mapElement.current, {
        center: initialLocation,
        zoom: zoom,
        tilt: 0,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        streetViewControl: false,
        zoomControl: false,
      });
      setMaps({ map, geometryLibrary, placesLibrary, initialLocation });
    })().catch((e) => console.error('Failed to initialize Google Maps', e));
    return () => {
      cancelled = true;
    };
  }, [mapElement, apiKey, address, zoom]);

  return maps;
}
