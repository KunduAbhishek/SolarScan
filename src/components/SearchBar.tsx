import type { MdFilledTextField } from '@material/web/textfield/filled-text-field';
import { useEffect, useRef, useState } from 'react';
import { useNativeEvent } from '../hooks/useNativeEvent';

export default function SearchBar({
  placesLibrary,
  map,
  initialValue = '',
  zoom = 19,
  onSelect,
}: {
  placesLibrary: google.maps.PlacesLibrary;
  map: google.maps.Map;
  initialValue?: string;
  zoom?: number;
  onSelect: (location: google.maps.LatLng) => void;
}) {
  const textFieldRef = useRef<MdFilledTextField>(null);

  // Uses the Places API (New) instead of the legacy Autocomplete widget.
  // https://developers.google.com/maps/documentation/javascript/place-autocomplete-data
  const [predictions, setPredictions] = useState<google.maps.places.PlacePrediction[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken>(undefined);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestRequest = useRef(0);

  useEffect(() => {
    sessionToken.current = new placesLibrary.AutocompleteSessionToken();
    return () => clearTimeout(debounceTimer.current);
  }, [placesLibrary]);

  // Set the initial text imperatively so that later typing is never overwritten.
  useEffect(() => {
    if (textFieldRef.current) textFieldRef.current.value = initialValue;
  }, [initialValue]);

  async function fetchPredictions(input: string) {
    const requestId = ++latestRequest.current;
    try {
      const { suggestions } =
        await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: sessionToken.current,
        });
      // Ignore responses that arrive after a newer request was sent.
      if (requestId !== latestRequest.current) return;
      setPredictions(
        suggestions
          .map((s) => s.placePrediction)
          .filter((p): p is google.maps.places.PlacePrediction => p != null),
      );
      setActiveIndex(-1);
    } catch (e) {
      console.error('Place autocomplete failed', e);
      setPredictions([]);
    }
  }

  async function selectPrediction(prediction: google.maps.places.PlacePrediction) {
    setPredictions([]);
    const place = prediction.toPlace();
    // fetchFields ends the autocomplete session, so start a new one.
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
    sessionToken.current = new placesLibrary.AutocompleteSessionToken();

    const textField = textFieldRef.current!;
    if (!place.location) {
      textField.value = '';
      return;
    }
    map.setCenter(place.location);
    map.setZoom(zoom);

    onSelect(place.location);
    textField.value = place.displayName ?? place.formattedAddress ?? '';
  }

  useNativeEvent(textFieldRef, 'input', () => {
    clearTimeout(debounceTimer.current);
    const input = textFieldRef.current!.value.trim();
    if (!input) {
      latestRequest.current++;
      setPredictions([]);
      return;
    }
    debounceTimer.current = setTimeout(() => fetchPredictions(input), 250);
  });

  useNativeEvent<KeyboardEvent>(textFieldRef, 'keydown', (event) => {
    if (predictions.length == 0) return;
    if (event.key == 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((activeIndex + 1) % predictions.length);
    } else if (event.key == 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((activeIndex - 1 + predictions.length) % predictions.length);
    } else if (event.key == 'Enter') {
      event.preventDefault();
      selectPrediction(predictions[Math.max(activeIndex, 0)]);
    } else if (event.key == 'Escape') {
      setPredictions([]);
    }
  });

  useNativeEvent(textFieldRef, 'focusout', () => setPredictions([]));

  return (
    <div className="relative">
      <md-filled-text-field
        ref={textFieldRef}
        label="Search an address"
        className="w-full"
        role="combobox"
        aria-expanded={predictions.length > 0}
        aria-controls="search-predictions"
        tabIndex={-1}
      >
        <md-icon slot="leading-icon">search</md-icon>
      </md-filled-text-field>

      {predictions.length > 0 && (
        <ul
          id="search-predictions"
          role="listbox"
          className="absolute z-10 w-full mt-1 py-1 rounded-lg shadow-lg surface on-surface-text"
        >
          {predictions.map((prediction, i) => (
            // mousedown fires before the text field blur, so the click isn't lost.
            <li
              key={prediction.placeId}
              role="option"
              aria-selected={i == activeIndex}
              className={`px-4 py-2 cursor-pointer body-medium ${
                i == activeIndex ? 'surface-variant' : ''
              }`}
              onMouseDown={(event) => {
                event.preventDefault();
                selectPrediction(prediction);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {prediction.text.toString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
