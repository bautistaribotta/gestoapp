import { parseDecimal } from './text';

type MeasurementRange = {
  min: number;
  max: number;
  unit: string;
  /** Para el mensaje de error, ej. «El peso». */
  subject: string;
};

/**
 * Rangos amplios a propósito: tienen que entrar personas gestantes con talla baja (por ejemplo,
 * con enanismo, que pueden medir menos de un metro) o con pesos fuera de lo habitual. Solo
 * frenan errores de carga, como 1630 cm o 7 kg.
 */
export const WEIGHT_RANGE: MeasurementRange = { min: 20, max: 300, unit: 'kg', subject: 'El peso' };
export const HEIGHT_RANGE: MeasurementRange = { min: 50, max: 230, unit: 'cm', subject: 'La altura' };

/** Valida un campo opcional: vacío es válido. Devuelve el número o el mensaje de error. */
export function parseMeasurement(text: string, range: MeasurementRange) {
  if (!text.trim()) return { value: null, error: null };
  const value = parseDecimal(text);
  if (value === null || value < range.min || value > range.max) {
    return { value: null, error: `${range.subject} va de ${range.min} a ${range.max} ${range.unit}.` };
  }
  return { value, error: null };
}
