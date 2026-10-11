import type { SQLiteDatabase } from 'expo-sqlite';

import { isoFromDay, todayDay } from '@/lib/dates';

export type Patient = {
  id: number;
  name: string;
  age: number;
  /** Peso en kg. */
  weight: number | null;
  /** Altura en centímetros. */
  heightCm: number | null;
  /** Fecha de última menstruación (YYYY-MM-DD). */
  fum: string | null;
  /** Fecha de la ecografía de referencia (YYYY-MM-DD). */
  ecoDate: string | null;
  /** Edad gestacional medida en esa ecografía, en días. */
  ecoGaDays: number | null;
  /** Última vez que se vio a la paciente (YYYY-MM-DD). */
  lastSeen: string;
};

export type NewPatient = Omit<Patient, 'id' | 'lastSeen'>;

const PATIENT_COLUMNS = `id, name, age, weight, height_cm AS heightCm, fum,
  eco_date AS ecoDate, eco_ga_days AS ecoGaDays, last_seen AS lastSeen`;

export function listPatients(db: SQLiteDatabase) {
  return db.getAllAsync<Patient>(
    `SELECT ${PATIENT_COLUMNS} FROM patients ORDER BY last_seen DESC, id DESC`,
  );
}

export function getPatient(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Patient>(`SELECT ${PATIENT_COLUMNS} FROM patients WHERE id = ?`, id);
}

export async function insertPatient(db: SQLiteDatabase, patient: NewPatient): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO patients (name, age, weight, height_cm, fum, eco_date, eco_ga_days, last_seen)
     VALUES ($name, $age, $weight, $heightCm, $fum, $ecoDate, $ecoGaDays, $lastSeen)`,
    {
      $name: patient.name,
      $age: patient.age,
      $weight: patient.weight,
      $heightCm: patient.heightCm,
      $fum: patient.fum,
      $ecoDate: patient.ecoDate,
      $ecoGaDays: patient.ecoGaDays,
      $lastSeen: isoFromDay(todayDay()),
    },
  );
  return result.lastInsertRowId;
}
