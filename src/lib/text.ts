export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

/** Acepta coma o punto decimal ("1,63" o "1.63"). */
export function parseDecimal(value: string): number | null {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatDecimal(value: number, digits?: number): string {
  return (digits === undefined ? String(value) : value.toFixed(digits)).replace('.', ',');
}
