import type { SQLiteDatabase } from 'expo-sqlite';

import { getSettings } from './settings';

/** Constancia local de la aceptación de los Términos y la Política de Privacidad. */
export type LegalAcceptance = {
  version: string;
  /** Fecha ISO (AAAA-MM-DD). */
  acceptedAt: string;
};

const VERSION_KEY = 'legal_version';
const ACCEPTED_AT_KEY = 'legal_accepted_at';

export async function getLegalAcceptance(db: SQLiteDatabase): Promise<LegalAcceptance | null> {
  const values = await getSettings(db, [VERSION_KEY, ACCEPTED_AT_KEY]);
  const version = values[VERSION_KEY];
  const acceptedAt = values[ACCEPTED_AT_KEY];
  if (!version || !acceptedAt) return null;
  return { version, acceptedAt };
}

export function legalAcceptanceEntries(acceptance: LegalAcceptance): Record<string, string> {
  return { [VERSION_KEY]: acceptance.version, [ACCEPTED_AT_KEY]: acceptance.acceptedAt };
}
