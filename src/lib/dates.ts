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

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** «AAAA-MM-DD» → número de día. Devuelve null si el formato no es ese o la fecha no existe (ej. 30 de febrero). */
export function dayFromIso(value: string | null | undefined): number | null {
  const match = value ? ISO_DATE.exec(value) : null;
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Date.UTC corre las fechas inválidas al mes siguiente: si no coincide, la fecha no existe.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return Math.round(date.getTime() / DAY_MS);
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

/** Ej. "5 oct 2026". */
export function formatMediumDay(day: number): string {
  const date = new Date(day * DAY_MS);
  return `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Día de la semana en minúscula, ej. "lunes". */
export function weekdayName(day: number): string {
  return WEEKDAYS[new Date(day * DAY_MS).getUTCDay()].toLowerCase();
}

export function seenLabel(day: number, today: number): string {
  const diff = today - day;
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  const date = new Date(day * DAY_MS);
  return `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`;
}
