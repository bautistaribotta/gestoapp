import type { SQLiteDatabase } from 'expo-sqlite';

import { withWriteTransaction } from './transaction';

export async function getSettings(
  db: SQLiteDatabase,
  keys: readonly string[],
): Promise<Record<string, string>> {
  const placeholders = keys.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM settings WHERE key IN (${placeholders})`,
    ...keys,
  );
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

/** Guarda varios valores en una sola transacción. */
export async function setSettings(db: SQLiteDatabase, entries: Record<string, string>) {
  await withWriteTransaction(db, async () => {
    const upsert = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
    for (const [key, value] of Object.entries(entries)) {
      await db.runAsync(upsert, key, value);
    }
  });
}
