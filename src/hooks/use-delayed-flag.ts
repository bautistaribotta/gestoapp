import { useEffect, useState } from 'react';

/** Umbral a partir del cual una carga se considera lenta y vale la pena mostrarla. */
export const SLOW_LOADING_MS = 300;

/**
 * Devuelve true solo si `active` sigue en true después de `delayMs`.
 * Evita que el indicador de carga parpadee en operaciones rápidas.
 */
export function useDelayedFlag(active: boolean, delayMs = SLOW_LOADING_MS) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setElapsed(true), delayMs);
    return () => {
      clearTimeout(timer);
      setElapsed(false);
    };
  }, [active, delayMs]);

  return active && elapsed;
}
