import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';

import { todayDay } from '@/lib/dates';

const TodayContext = createContext<number | null>(null);

/** Milisegundos hasta un instante después de la próxima medianoche local. */
function msUntilTomorrow() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return tomorrow.getTime() - now.getTime();
}

/**
 * El día de hoy para las pantallas. Se actualiza a la medianoche y al volver a la app, así la fecha
 * del encabezado, la edad gestacional y los «Hace X días» no quedan del día anterior si la app
 * estuvo abierta o en segundo plano al cambiar el día.
 */
export function TodayProvider({ children }: PropsWithChildren) {
  const [today, setToday] = useState(todayDay);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      // Si el día no cambió, React no vuelve a dibujar nada.
      setToday(todayDay());
      clearTimeout(timer);
      timer = setTimeout(refresh, msUntilTomorrow());
    };
    timer = setTimeout(refresh, msUntilTomorrow());
    // En segundo plano los timers se pausan: al volver se recalcula igual.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return <TodayContext value={today}>{children}</TodayContext>;
}

/** Día de hoy (días desde 1970-01-01), actualizado al cambiar el día. */
export function useToday() {
  const today = use(TodayContext);
  if (today === null) throw new Error('useToday debe usarse dentro de TodayProvider');
  return today;
}
