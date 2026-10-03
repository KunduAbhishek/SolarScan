<!--
 Copyright 2023 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 -->

<script lang="ts">
  /* global google */

  import type { MdFilledTextField } from '@material/web/textfield/filled-text-field';

  export let location: google.maps.LatLng | undefined;

  export let placesLibrary: google.maps.PlacesLibrary;
  export let map: google.maps.Map;
  export let initialValue = '';
  export let zoom = 19;

  let textFieldElement: MdFilledTextField;

  // Uses the Places API (New) instead of the legacy Autocomplete widget.
  // https://developers.google.com/maps/documentation/javascript/place-autocomplete-data
  let predictions: google.maps.places.PlacePrediction[] = [];
  let activeIndex = -1;
  let sessionToken = new placesLibrary.AutocompleteSessionToken();
  let debounceTimer: ReturnType<typeof setTimeout>;
  let latestRequest = 0;

  function onInput() {
    clearTimeout(debounceTimer);
    const input = textFieldElement.value.trim();
    if (!input) {
      predictions = [];
      return;
    }
    debounceTimer = setTimeout(() => fetchPredictions(input), 250);
  }

  async function fetchPredictions(input: string) {
    const requestId = ++latestRequest;
    try {
      const { suggestions } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(
        { input, sessionToken },
      );
      // Ignore responses that arrive after a newer request was sent.
      if (requestId !== latestRequest) return;
      predictions = suggestions
        .map((s) => s.placePrediction)
        .filter((p): p is google.maps.places.PlacePrediction => p != null);
      activeIndex = -1;
    } catch (e) {
      console.error('Place autocomplete failed', e);
      predictions = [];
    }
  }

  async function selectPrediction(prediction: google.maps.places.PlacePrediction) {
    predictions = [];
    const place = prediction.toPlace();
    // fetchFields ends the autocomplete session, so start a new one.
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
    sessionToken = new placesLibrary.AutocompleteSessionToken();

    if (!place.location) {
      textFieldElement.value = '';
      return;
    }
    map.setCenter(place.location);
    map.setZoom(zoom);

    location = place.location;
    textFieldElement.value = place.displayName ?? place.formattedAddress ?? '';
  }

  function onKeydown(event: KeyboardEvent) {
    if (predictions.length == 0) return;
    if (event.key == 'ArrowDown') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % predictions.length;
    } else if (event.key == 'ArrowUp') {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + predictions.length) % predictions.length;
    } else if (event.key == 'Enter') {
      event.preventDefault();
      selectPrediction(predictions[Math.max(activeIndex, 0)]);
    } else if (event.key == 'Escape') {
      predictions = [];
    }
  }
</script>

<div class="relative">
  <md-filled-text-field
    bind:this={textFieldElement}
    label="Search an address"
    value={initialValue}
    class="w-full"
    role="combobox"
    aria-expanded={predictions.length > 0}
    aria-controls="search-predictions"
    tabindex="-1"
    on:input={onInput}
    on:keydown={onKeydown}
    on:blur={() => (predictions = [])}
  >
    <md-icon slot="leadingicon">search</md-icon>
  </md-filled-text-field>

  {#if predictions.length > 0}
    <ul
      id="search-predictions"
      role="listbox"
      class="absolute z-10 w-full mt-1 py-1 rounded-lg shadow-lg surface on-surface-text"
    >
      {#each predictions as prediction, i}
        <!-- mousedown fires before the text field's blur, so the click isn't lost. -->
        <li
          role="option"
          aria-selected={i == activeIndex}
          class="px-4 py-2 cursor-pointer body-medium"
          class:surface-variant={i == activeIndex}
          on:mousedown|preventDefault={() => selectPrediction(prediction)}
          on:mouseenter={() => (activeIndex = i)}
        >
          {prediction.text.toString()}
        </li>
      {/each}
    </ul>
  {/if}
</div>
