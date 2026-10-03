import { useEffect, useRef } from 'react';

/** Calls `onTick` every `intervalMs` while `active` is true. The timer is cleared on cleanup. */
export function useAnimationTick(active: boolean, onTick: () => void, intervalMs = 1000) {
  const latest = useRef(onTick);
  useEffect(() => {
    latest.current = onTick;
  });

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => latest.current(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}
