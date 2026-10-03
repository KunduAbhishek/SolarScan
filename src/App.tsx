import { useEffect, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import Sections from './sections/Sections';
import { SolarProvider } from './state/SolarContext';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const defaultPlace = {
  name: 'Rinconada Library',
  address: '1213 Newell Rd, Palo Alto, CA 94303',
};
const zoom = 19;

export default function App() {
  const mapElement = useRef<HTMLDivElement>(null);
  const maps = useGoogleMaps(mapElement, googleMapsApiKey, defaultPlace.address, zoom);

  // The location the sections analyze: the default place first, then whatever the user searches.
  const [location, setLocation] = useState<google.maps.LatLng>();
  useEffect(() => {
    if (maps) setLocation((current) => current ?? maps.initialLocation);
  }, [maps]);

  return (
    <main className="surface on-surface-text body-medium flex flex-col w-screen h-screen">
      <div className="flex flex-row h-full">
        {/* Main map */}
        <div ref={mapElement} className="w-full" />

        {/* Side bar */}
        <aside className="flex-none md:w-96 w-80 p-2 pt-3 overflow-auto">
          <div className="flex flex-col space-y-2 h-full">
            {maps && (
              <SearchBar
                placesLibrary={maps.placesLibrary}
                map={maps.map}
                initialValue={defaultPlace.name}
                zoom={zoom}
                onSelect={setLocation}
              />
            )}

            <div className="p-4 surface-variant outline-text rounded-lg space-y-3">
              <p>
                <a
                  className="primary-text"
                  href="https://developers.google.com/maps/documentation/solar/overview?hl=en"
                  target="_blank"
                  rel="noreferrer"
                >
                  Two distinct endpoints of the <b>Solar API</b>
                  <md-icon className="text-sm">open_in_new</md-icon>
                </a>{' '}
                offer many benefits to solar marketplace websites, solar installers, and solar SaaS
                designers.
              </p>

              <p>
                <b>Click on an area below</b> to see what type of information the Solar API can
                provide.
              </p>
            </div>

            {maps && location && (
              <SolarProvider>
                <Sections
                  location={location}
                  map={maps.map}
                  geometryLibrary={maps.geometryLibrary}
                  googleMapsApiKey={googleMapsApiKey}
                />
              </SolarProvider>
            )}

            <div className="grow" />

            <div className="flex flex-col items-center w-full">
              <md-text-button href="https://github.com/KunduAbhishek/SolarScan" target="_blank">
                View code on GitHub
                <img slot="icon" src="/github-mark.svg" alt="GitHub" width="16" height="16" />
              </md-text-button>
            </div>

            <span className="pb-4 text-center outline-text label-small">
              This is not an officially supported Google product.
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
