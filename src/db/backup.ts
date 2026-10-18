import type { SQLiteDatabase } from 'expo-sqlite';

import { notifyPatientsChanged } from './patients';
import { getProfile, isProfileTitle, profileEntries, type Profile } from './profile';

/** Fila de `patients` tal como está en la base, para copiarla sin perder columnas. */
export type PatientRow = {
  id: number;
  name: string;
  age: number | null;
  weight: number | null;
  height_cm: number | null;
  fum: string | null;
  attended_at: string;
  created_at: string;
  eco_date: string | null;
  eco_ga_days: number | null;
  note: string | null;
  note_updated_at: string | null;
};

/** Contenido de una copia: las pacientes con sus notas y el perfil. La aceptación legal no viaja. */
export type BackupData = {
  profile: Profile | null;
  patients: PatientRow[];
};

/** El archivo se pudo descifrar, pero lo que tiene adentro no es una copia válida. */
export class InvalidBackupDataError extends Error {
  constructor(detail: string) {
    super(`Copia inválida: ${detail}`);
    this.name = 'InvalidBackupDataError';
  }
}

const COLUMNS = [
  'id',
  'name',
  'age',
  'weight',
  'height_cm',
  'fum',
  'attended_at',
  'created_at',
  'eco_date',
  'eco_ga_days',
  'note',
  'note_updated_at',
] as const satisfies readonly (keyof PatientRow)[];

export async function readBackupData(db: SQLiteDatabase): Promise<BackupData> {
  const [profile, patients] = await Promise.all([
    getProfile(db),
    db.getAllAsync<PatientRow>(`SELECT ${COLUMNS.join(', ')} FROM patients ORDER BY id`),
  ]);
  return { profile, patients };
}

export async function countPatients(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM patients');
  return row?.count ?? 0;
}

/**
 * Reemplaza todas las pacientes por las de la copia y, si la copia trae perfil, también el perfil.
 * Todo en una transacción: si algo falla, la base queda como estaba.
 */
export async function replaceWithBackup(db: SQLiteDatabase, data: BackupData) {
  const placeholders = COLUMNS.map(() => '?').join(', ');
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM patients');
    const insert = await txn.prepareAsync(
      `INSERT INTO patients (${COLUMNS.join(', ')}) VALUES (${placeholders})`,
    );
    try {
      for (const patient of data.patients) {
        await insert.executeAsync(COLUMNS.map((column) => patient[column]));
      }
    } finally {
      await insert.finalizeAsync();
    }
    if (data.profile) {
      for (const [key, value] of Object.entries(profileEntries(data.profile))) {
        await txn.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
      }
    }
  });
  notifyPatientsChanged();
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// created_at viene de datetime('now') de SQLite: «AAAA-MM-DD HH:MM:SS».
const SQLITE_DATETIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalNumber(value: unknown, field: string, integer = false): number | null {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || (integer && !Number.isInteger(value))) {
    throw new InvalidBackupDataError(field);
  }
  return value;
}

function optionalText(value: unknown, field: string, pattern?: RegExp): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || (pattern && !pattern.test(value))) {
    throw new InvalidBackupDataError(field);
  }
  return value;
}

function requiredText(value: unknown, field: string, pattern?: RegExp): string {
  const text = optionalText(value, field, pattern);
  if (text === null || text.trim() === '') throw new InvalidBackupDataError(field);
  return text;
}

function parsePatient(value: unknown, index: number): PatientRow {
  if (!isRecord(value)) throw new InvalidBackupDataError(`paciente ${index}`);
  const field = (name: string) => `paciente ${index}: ${name}`;
  const id = optionalNumber(value.id, field('id'), true);
  if (id === null || id <= 0) throw new InvalidBackupDataError(field('id'));
  return {
    id,
    name: requiredText(value.name, field('name')),
    age: optionalNumber(value.age ?? null, field('age'), true),
    weight: optionalNumber(value.weight ?? null, field('weight')),
    height_cm: optionalNumber(value.height_cm ?? null, field('height_cm')),
    fum: optionalText(value.fum ?? null, field('fum'), ISO_DATE),
    // Las copias exportadas antes de renombrar la columna traen last_seen.
    attended_at: requiredText(value.attended_at ?? value.last_seen, field('attended_at'), ISO_DATE),
    created_at: requiredText(value.created_at, field('created_at'), SQLITE_DATETIME),
    eco_date: optionalText(value.eco_date ?? null, field('eco_date'), ISO_DATE),
    eco_ga_days: optionalNumber(value.eco_ga_days ?? null, field('eco_ga_days'), true),
    note: optionalText(value.note ?? null, field('note')),
    note_updated_at: optionalText(value.note_updated_at ?? null, field('note_updated_at'), ISO_DATE),
  };
}

/** Valida lo que salió del archivo antes de tocar la base: nunca se confía en su contenido. */
export function parseBackupData(value: unknown): BackupData {
  if (!isRecord(value) || !Array.isArray(value.patients)) {
    throw new InvalidBackupDataError('estructura');
  }
  const patients = value.patients.map(parsePatient);
  if (new Set(patients.map((patient) => patient.id)).size !== patients.length) {
    throw new InvalidBackupDataError('ids repetidos');
  }

  let profile: Profile | null = null;
  if (value.profile !== null && value.profile !== undefined) {
    if (!isRecord(value.profile) || !isProfileTitle(value.profile.title)) {
      throw new InvalidBackupDataError('perfil');
    }
    profile = { title: value.profile.title, name: requiredText(value.profile.name, 'perfil: name') };
  }
  return { profile, patients };
}
