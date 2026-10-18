import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Cada paso lleva la base de la versión N a la N + 1 (el primero, de 0 a 1).
 * Para cambiar el esquema se agrega un paso al final: nunca se editan los que ya se publicaron.
 */
const MIGRATIONS: string[] = [
  // 1: tablas iniciales.
  `
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
  `,
  // 2: la altura pasa de metros a centímetros y se suma la ecografía como referencia.
  `
    ALTER TABLE patients RENAME COLUMN height TO height_cm;
    UPDATE patients SET height_cm = ROUND(height_cm * 100) WHERE height_cm IS NOT NULL AND height_cm < 3;
    ALTER TABLE patients ADD COLUMN eco_date TEXT;
    ALTER TABLE patients ADD COLUMN eco_ga_days INTEGER;
  `,
  // 3: nota única por paciente, con la fecha de la última edición.
  `
    ALTER TABLE patients ADD COLUMN note TEXT;
    ALTER TABLE patients ADD COLUMN note_updated_at TEXT;
  `,
  // 4: la app deja de cargar pacientes de ejemplo: se borran las que quedaron de instalaciones anteriores.
  `
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
  `,
  // 5: la edad pasa a ser opcional: SQLite no permite quitar un NOT NULL, así que se rehace la tabla.
  `
    CREATE TABLE patients_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      weight REAL,
      height_cm REAL,
      fum TEXT,
      last_seen TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      eco_date TEXT,
      eco_ga_days INTEGER,
      note TEXT,
      note_updated_at TEXT
    );
    INSERT INTO patients_new
      (id, name, age, weight, height_cm, fum, last_seen, created_at, eco_date, eco_ga_days, note, note_updated_at)
    SELECT id, name, age, weight, height_cm, fum, last_seen, created_at, eco_date, eco_ga_days, note, note_updated_at
    FROM patients;
    DROP TABLE patients;
    ALTER TABLE patients_new RENAME TO patients;
    CREATE INDEX idx_patients_last_seen ON patients (last_seen);
  `,
  // 6: last_seen pasa a llamarse attended_at: es la fecha en que se atendió a la paciente (la de alta
  // de la ficha) y no cambia al editarla ni al abrirla.
  `
    ALTER TABLE patients RENAME COLUMN last_seen TO attended_at;
    DROP INDEX idx_patients_last_seen;
    CREATE INDEX idx_patients_attended_at ON patients (attended_at);
  `,
];

/**
 * Migraciones versionadas con PRAGMA user_version. Se ejecuta en el onInit del SQLiteProvider.
 * Cada paso corre en su propia transacción junto con la versión que deja: si se interrumpe,
 * se deshace entero y la próxima vez se reintenta ese mismo paso.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= MIGRATIONS.length) return;

  // El modo WAL no se puede cambiar dentro de una transacción. Queda guardado en el archivo.
  await db.execAsync("PRAGMA journal_mode = 'wal'");

  for (let version = currentVersion; version < MIGRATIONS.length; version++) {
    // Mientras corre onInit nada más usa la base, así que no hace falta una transacción exclusiva
    // (que además no existe en web).
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
