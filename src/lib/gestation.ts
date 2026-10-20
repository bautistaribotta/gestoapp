import { dayFromIso, formatDay } from './dates';

const PREGNANCY_DAYS = 280;
/** Tope de gestación que se acepta: 300 días, es decir, 42 s 6 d. */
const MAX_GESTATION_DAYS = 300;

export type Trimester = 1 | 2 | 3;

export type Gestation = {
  /** Edad gestacional, ej. "12 s 3 d". */
  age: string;
  /** Semanas en palabras, ej. "12 semanas" o "1 semana". */
  weeksLabel: string;
  /** Días en palabras, ej. "3 días" o "1 día"; null si son 0. */
  daysLabel: string | null;
  /** Mes aproximado, ej. "≈ 3° mes". */
  month: string;
  trimester: Trimester;
  trimesterLabel: string;
  /** Fecha probable de parto, ej. "05/03/2027". */
  dueDate: string;
};

/** Datos de datación de una paciente: FUM y, opcionalmente, una ecografía. */
export type DatingInput = {
  fum: string | null;
  ecoDate: string | null;
  /** Edad gestacional medida en la ecografía, en días. */
  ecoGaDays: number | null;
};

export type DatingReference = {
  /** Día equivalente a la FUM (real o corregida por ecografía). */
  day: number;
  source: 'fum' | 'eco';
  /** Día de la FUM o de la ecografía, según la fuente. */
  sourceDay: number;
};

export type Discordance = {
  over: boolean;
  title: string;
};

export function formatWeeksDays(days: number): string {
  return `${Math.floor(days / 7)} s ${days % 7} d`;
}

/** El tope en semanas y días («42 s 6 d»), para los mensajes: así no se desfasa del número. */
export const MAX_GESTATION_LABEL = formatWeeksDays(MAX_GESTATION_DAYS);

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function trimesterOf(days: number): Trimester {
  if (days < 98) return 1;
  if (days < 196) return 2;
  return 3;
}

function validFumDay(fum: string | null, today: number): number | null {
  const day = dayFromIso(fum);
  if (day === null || day > today || today - day > MAX_GESTATION_DAYS) return null;
  return day;
}

function validEco(input: DatingInput, today: number) {
  const day = dayFromIso(input.ecoDate);
  if (day === null || day > today || !input.ecoGaDays || input.ecoGaDays <= 0) return null;
  return { day, gaDays: input.ecoGaDays };
}

/** Mensaje de error de la FUM, o null si es válida o está vacía. */
export function fumError(fum: string | null, today: number): string | null {
  const day = dayFromIso(fum);
  if (day === null) return null;
  if (day > today) return 'La FUM no puede ser posterior a hoy.';
  if (today - day > MAX_GESTATION_DAYS) return `La FUM supera las ${MAX_GESTATION_LABEL} de gestación.`;
  return null;
}

/** La ecografía, si está cargada, reemplaza a la FUM como referencia. */
export function datingReference(input: DatingInput, today: number): DatingReference | null {
  const eco = validEco(input, today);
  if (eco) {
    return { day: eco.day - eco.gaDays, source: 'eco', sourceDay: eco.day };
  }
  const fumDay = validFumDay(input.fum, today);
  if (fumDay !== null) {
    return { day: fumDay, source: 'fum', sourceDay: fumDay };
  }
  return null;
}

/** Gestación a partir del día de referencia. Devuelve null si queda fuera de rango. */
export function gestationFromReference(referenceDay: number, today: number): Gestation | null {
  const days = today - referenceDay;
  if (days < 0 || days > MAX_GESTATION_DAYS) return null;

  const trimester = trimesterOf(days);
  return {
    age: formatWeeksDays(days),
    weeksLabel: plural(Math.floor(days / 7), 'semana', 'semanas'),
    daysLabel: days % 7 ? plural(days % 7, 'día', 'días') : null,
    month: `≈ ${Math.floor(days / 30.4) + 1}° mes`,
    trimester,
    trimesterLabel: `T${trimester} · ${trimester}° trimestre`,
    dueDate: formatDay(referenceDay + PREGNANCY_DAYS),
  };
}

export function gestationFromFum(fum: string | null, today: number): Gestation | null {
  const fumDay = validFumDay(fum, today);
  return fumDay === null ? null : gestationFromReference(fumDay, today);
}

/** Umbral ACOG de discordancia según la edad gestacional de la ecografía. */
function acogThreshold(ecoGaDays: number): number {
  if (ecoGaDays <= 62) return 5; // hasta 8 s 6 d
  if (ecoGaDays <= 111) return 7; // 9 s 0 d – 15 s 6 d
  if (ecoGaDays <= 153) return 10; // 16 s 0 d – 21 s 6 d
  if (ecoGaDays <= 195) return 14; // 22 s 0 d – 27 s 6 d
  return 21; // 28 s 0 d o más
}

/** Compara la FUM con la ecografía cuando las dos están cargadas. */
export function discordance(input: DatingInput, today: number): Discordance | null {
  const eco = validEco(input, today);
  const fumDay = validFumDay(input.fum, today);
  if (!eco || fumDay === null) return null;

  const diff = Math.abs(eco.day - fumDay - eco.gaDays);
  const over = diff > acogThreshold(eco.gaDays);
  const days = plural(diff, 'día', 'días');
  return {
    over,
    title: over ? `Discordancia de ${days}` : `Concordante · diferencia de ${days}`,
  };
}

export type KeyDate = {
  label: string;
  /** Aclaración opcional debajo del nombre. */
  sub: string | null;
  day: number;
};

/** Fechas clave a partir del día de referencia (FUM real o corregida por ecografía). */
export function keyDates(reference: DatingReference): KeyDate[] {
  const fromEco = reference.source === 'eco';
  return [
    {
      label: fromEco ? 'FUM por ecografía' : 'FUM',
      sub: fromEco
        ? `Calculada desde la eco del ${formatDay(reference.sourceDay)}`
        : 'Fecha de última menstruación',
      day: reference.day,
    },
    { label: 'Concepción', sub: null, day: reference.day + 14 },
    { label: '2° trimestre', sub: null, day: reference.day + 98 },
    { label: '3° trimestre', sub: null, day: reference.day + 196 },
    { label: 'FPP', sub: 'Fecha probable de parto', day: reference.day + PREGNANCY_DAYS },
  ];
}

/** Valida la ecografía cargada y devuelve la EG en días, o un mensaje si falta algo. */
export function ecoGaDaysFrom(date: string | null, weeks: string, days: string, today: number) {
  const ecoDay = dayFromIso(date);
  const parsedWeeks = weeks ? parseInt(weeks, 10) : NaN;
  const parsedDays = days ? parseInt(days, 10) : 0;
  if (ecoDay === null || Number.isNaN(parsedWeeks)) {
    return { gaDays: null, message: 'Completá la fecha y las semanas de la ecografía.' };
  }
  if (ecoDay > today) {
    return { gaDays: null, message: 'La ecografía no puede ser posterior a hoy.' };
  }
  if (parsedWeeks > 42 || Number.isNaN(parsedDays) || parsedDays > 6) {
    return { gaDays: null, message: 'La EG va de 0 a 42 semanas y de 0 a 6 días.' };
  }
  const gaDays = parsedWeeks * 7 + parsedDays;
  if (gaDays <= 0) {
    return { gaDays: null, message: 'La EG por ecografía tiene que ser mayor a 0.' };
  }
  return { gaDays, message: null };
}
