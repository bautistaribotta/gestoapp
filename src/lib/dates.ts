/**
 * Las fechas se manejan como "número de día" (días desde 1970-01-01 en UTC)
 * para que las restas den días enteros sin problemas de zona horaria.
 */
const DAY_MS = 864e5;

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const pad = (value: number) => String(value).padStart(2, '0');

export function dayFromIso(value: string | null | undefined): number | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function dayFromDate(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function todayDay(): number {
  return dayFromDate(new Date());
}

export function isoFromDay(day: number): string {
  const date = new Date(day * DAY_MS);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Fecha local (medianoche) para los selectores nativos. */
export function localDateFromDay(day: number): Date {
  const date = new Date(day * DAY_MS);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function formatDay(day: number): string {
  const date = new Date(day * DAY_MS);
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
}

export function formatLongDay(day: number): string {
  const date = new Date(day * DAY_MS);
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} de ${MONTHS_LONG[date.getUTCMonth()]}`;
}

export function seenLabel(day: number, today: number): string {
  const diff = today - day;
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  const date = new Date(day * DAY_MS);
  return `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`;
}
