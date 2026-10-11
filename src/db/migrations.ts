import type { SQLiteDatabase } from 'expo-sqlite';

import { seedPatients } from './seed';

const DATABASE_VERSION = 2;

/** Migraciones versionadas con PRAGMA user_version. Se ejecuta en el onInit del SQLiteProvider. */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  const isNewDatabase = currentVersion === 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        weight REAL,
        height REAL,
        fum TEXT,
        last_seen TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX idx_patients_last_seen ON patients (last_seen);
    `);
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    // La altura pasa de metros a centímetros y se suma la ecografía como referencia.
    await db.execAsync(`
      ALTER TABLE patients RENAME COLUMN height TO height_cm;
      UPDATE patients SET height_cm = ROUND(height_cm * 100) WHERE height_cm IS NOT NULL AND height_cm < 3;
      ALTER TABLE patients ADD COLUMN eco_date TEXT;
      ALTER TABLE patients ADD COLUMN eco_ga_days INTEGER;
    `);
    currentVersion = 2;
  }

  if (isNewDatabase) {
    await seedPatients(db);
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}
