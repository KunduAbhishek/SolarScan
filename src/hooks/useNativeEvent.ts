import { useEffect, useRef, type RefObject } from 'react';

/**
 * Listens to a DOM event on a custom element (like the Material Web components).
 * React only knows about its own synthetic events, and Material Web re-dispatches
 * `change` and `input` events from its internal inputs, so we attach native listeners.
 *
 * The element must be rendered unconditionally by the component calling this hook.
 */
export function useNativeEvent<E extends Event = Event>(
  ref: RefObject<HTMLElement | null>,
  type: string,
  handler: (event: E) => void,
) {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const listener = (event: Event) => latest.current(event as E);
    element.addEventListener(type, listener);
    return () => element.removeEventListener(type, listener);
  }, [ref, type]);
}
