import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 4;

/** Migraciones versionadas con PRAGMA user_version. Se ejecuta en el onInit del SQLiteProvider. */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

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

  if (currentVersion < 3) {
    // Nota única por paciente, con la fecha de la última edición.
    await db.execAsync(`
      ALTER TABLE patients ADD COLUMN note TEXT;
      ALTER TABLE patients ADD COLUMN note_updated_at TEXT;
    `);
    currentVersion = 3;
  }

  if (currentVersion < 4) {
    // La app deja de cargar pacientes de ejemplo: se borran las que quedaron de instalaciones anteriores.
    await db.execAsync(`
      DELETE FROM patients WHERE (name, age, weight, height_cm) IN (VALUES
        ('Lucía Fernández', 31, 64, 163), ('Camila Rodríguez', 27, 58, 160),
        ('Valentina Gómez', 34, 71, 168), ('Sofía López', 29, 62, 165),
        ('Martina Díaz', 38, 69, 158), ('Florencia Martínez', 25, 55, 162),
        ('Agustina Pérez', 33, 66, 170), ('Julieta Sánchez', 30, 60, 164),
        ('Micaela Romero', 36, 74, 166), ('Rocío Álvarez', 28, 57, 159),
        ('Carolina Torres', 32, 68, 171), ('Paula Ruiz', 26, 61, 163),
        ('Antonella Flores', 35, 70, 167), ('Belén Acosta', 24, 54, 157),
        ('Daniela Medina', 39, 72, 165), ('Natalia Herrera', 31, 63, 162),
        ('Victoria Castro', 29, 59, 168), ('Milagros Suárez', 37, 67, 160)
      );
    `);
    currentVersion = 4;
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}
