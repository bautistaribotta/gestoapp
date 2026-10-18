import type { SQLiteDatabase } from 'expo-sqlite';

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

/**
 * Guarda varios valores en una sola transacción. Es exclusiva: solo entran las escrituras de `txn`,
 * así una consulta que corra al mismo tiempo en otra pantalla no queda mezclada en ella.
 */
export async function setSettings(db: SQLiteDatabase, entries: Record<string, string>) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    const upsert = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
    for (const [key, value] of Object.entries(entries)) {
      await txn.runAsync(upsert, key, value);
    }
  });
}
