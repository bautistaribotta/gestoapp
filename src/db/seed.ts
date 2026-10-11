import type { SQLiteDatabase } from 'expo-sqlite';

import { isoFromDay, todayDay } from '@/lib/dates';

type SeedPatient = [
  name: string,
  age: number,
  seenAgo: number,
  fumAgo: number,
  weight: number,
  heightCm: number,
  eco?: [daysAgo: number, gaDays: number],
  note?: [daysAgo: number, text: string],
];

/** Las dos ecografías de ejemplo muestran un caso concordante y uno discordante con la FUM. */
const SEED: SeedPatient[] = [
  [
    'Lucía Fernández', 31, 0, 198, 64, 163, [140, 58],
    [28, 'Hipotiroidismo en tratamiento con levotiroxina 50 mcg. Pedir TSH en el próximo control.'],
  ],
  ['Camila Rodríguez', 27, 0, 84, 58, 160],
  ['Valentina Gómez', 34, 0, 241, 71, 168, [180, 75]],
  ['Sofía López', 29, 1, 133, 62, 165],
  ['Martina Díaz', 38, 2, 61, 69, 158],
  ['Florencia Martínez', 25, 3, 175, 55, 162],
  ['Agustina Pérez', 33, 4, 220, 66, 170],
  ['Julieta Sánchez', 30, 5, 105, 60, 164],
  ['Micaela Romero', 36, 8, 259, 74, 166],
  ['Rocío Álvarez', 28, 9, 47, 57, 159],
  ['Carolina Torres', 32, 12, 190, 68, 171],
  ['Paula Ruiz', 26, 14, 152, 61, 163],
  ['Antonella Flores', 35, 17, 98, 70, 167],
  ['Belén Acosta', 24, 21, 236, 54, 157],
  ['Daniela Medina', 39, 26, 120, 72, 165],
  ['Natalia Herrera', 31, 33, 205, 63, 162],
  ['Victoria Castro', 29, 41, 70, 59, 168],
  ['Milagros Suárez', 37, 48, 168, 67, 160],
];

/** Carga las pacientes de ejemplo del prototipo, con fechas relativas al día de instalación. */
export async function seedPatients(db: SQLiteDatabase) {
  const today = todayDay();
  const statement = await db.prepareAsync(
    `INSERT INTO patients
       (name, age, weight, height_cm, fum, eco_date, eco_ga_days, note, note_updated_at, last_seen)
     VALUES
       ($name, $age, $weight, $heightCm, $fum, $ecoDate, $ecoGaDays, $note, $noteUpdatedAt, $lastSeen)`,
  );
  try {
    for (const [name, age, seenAgo, fumAgo, weight, heightCm, eco, note] of SEED) {
      await statement.executeAsync({
        $name: name,
        $age: age,
        $weight: weight,
        $heightCm: heightCm,
        $fum: isoFromDay(today - fumAgo),
        $ecoDate: eco ? isoFromDay(today - eco[0]) : null,
        $ecoGaDays: eco ? eco[1] : null,
        $note: note ? note[1] : null,
        $noteUpdatedAt: note ? isoFromDay(today - note[0]) : null,
        $lastSeen: isoFromDay(today - seenAgo),
      });
    }
  } finally {
    await statement.finalizeAsync();
  }
}
