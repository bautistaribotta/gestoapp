import type { SQLiteDatabase } from 'expo-sqlite';

import { isoFromDay, todayDay } from '@/lib/dates';

export type Patient = {
  id: number;
  name: string;
  /** Edad en años; opcional. */
  age: number | null;
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
  /** Nota única de la paciente. */
  note: string | null;
  /** Última edición de la nota (YYYY-MM-DD). */
  noteUpdatedAt: string | null;
  /** Última vez que se vio a la paciente (YYYY-MM-DD). */
  lastSeen: string;
};

export type PatientData = Omit<Patient, 'id' | 'lastSeen' | 'note' | 'noteUpdatedAt'>;

export type NewPatient = PatientData & {
  note: string | null;
};

const listeners = new Set<() => void>();

/** Avisa cuando cambian las pacientes, para recargar pantallas que siguen montadas (ej. Inicio). */
export function onPatientsChanged(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyPatientsChanged() {
  listeners.forEach((listener) => listener());
}

const PATIENT_COLUMNS = `id, name, age, weight, height_cm AS heightCm, fum,
  eco_date AS ecoDate, eco_ga_days AS ecoGaDays,
  note, note_updated_at AS noteUpdatedAt, last_seen AS lastSeen`;

export function listPatients(db: SQLiteDatabase) {
  return db.getAllAsync<Patient>(
    `SELECT ${PATIENT_COLUMNS} FROM patients ORDER BY last_seen DESC, id DESC`,
  );
}

export function getPatient(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Patient>(`SELECT ${PATIENT_COLUMNS} FROM patients WHERE id = ?`, id);
}

export async function insertPatient(db: SQLiteDatabase, patient: NewPatient): Promise<number> {
  const today = isoFromDay(todayDay());
  const result = await db.runAsync(
    `INSERT INTO patients
       (name, age, weight, height_cm, fum, eco_date, eco_ga_days, note, note_updated_at, last_seen)
     VALUES
       ($name, $age, $weight, $heightCm, $fum, $ecoDate, $ecoGaDays, $note, $noteUpdatedAt, $lastSeen)`,
    {
      $name: patient.name,
      $age: patient.age,
      $weight: patient.weight,
      $heightCm: patient.heightCm,
      $fum: patient.fum,
      $ecoDate: patient.ecoDate,
      $ecoGaDays: patient.ecoGaDays,
      $note: patient.note,
      $noteUpdatedAt: patient.note ? today : null,
      $lastSeen: today,
    },
  );
  notifyPatientsChanged();
  return result.lastInsertRowId;
}

export async function updatePatient(db: SQLiteDatabase, id: number, patient: PatientData) {
  await db.runAsync(
    `UPDATE patients
     SET name = $name, age = $age, weight = $weight, height_cm = $heightCm, fum = $fum,
         eco_date = $ecoDate, eco_ga_days = $ecoGaDays
     WHERE id = $id`,
    {
      $id: id,
      $name: patient.name,
      $age: patient.age,
      $weight: patient.weight,
      $heightCm: patient.heightCm,
      $fum: patient.fum,
      $ecoDate: patient.ecoDate,
      $ecoGaDays: patient.ecoGaDays,
    },
  );
  notifyPatientsChanged();
}

/** Reemplaza la nota de la paciente y registra la fecha de hoy. */
export async function updatePatientNote(db: SQLiteDatabase, id: number, note: string) {
  await db.runAsync(
    'UPDATE patients SET note = ?, note_updated_at = ? WHERE id = ?',
    note,
    isoFromDay(todayDay()),
    id,
  );
  notifyPatientsChanged();
}

export async function deletePatient(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM patients WHERE id = ?', id);
  notifyPatientsChanged();
}

/** Vuelve a insertar una paciente eliminada con el mismo id y todos sus datos («Deshacer»). */
export async function restorePatient(db: SQLiteDatabase, patient: Patient) {
  await db.runAsync(
    `INSERT INTO patients
       (id, name, age, weight, height_cm, fum, eco_date, eco_ga_days, note, note_updated_at, last_seen)
     VALUES
       ($id, $name, $age, $weight, $heightCm, $fum, $ecoDate, $ecoGaDays, $note, $noteUpdatedAt, $lastSeen)`,
    {
      $id: patient.id,
      $name: patient.name,
      $age: patient.age,
      $weight: patient.weight,
      $heightCm: patient.heightCm,
      $fum: patient.fum,
      $ecoDate: patient.ecoDate,
      $ecoGaDays: patient.ecoGaDays,
      $note: patient.note,
      $noteUpdatedAt: patient.noteUpdatedAt,
      $lastSeen: patient.lastSeen,
    },
  );
  notifyPatientsChanged();
}
