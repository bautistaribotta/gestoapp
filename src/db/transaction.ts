import type { SQLiteDatabase } from 'expo-sqlite';

let queue: Promise<unknown> = Promise.resolve();

/**
 * Transacción de escritura en la conexión principal. No se usa withExclusiveTransactionAsync porque
 * abre otra conexión, y con la base cifrada esa conexión no tiene la clave. Para que dos
 * transacciones de la app no se mezclen, se ejecutan de a una, en orden.
 */
export function withWriteTransaction(db: SQLiteDatabase, task: () => Promise<void>): Promise<void> {
  const run = queue.then(() => db.withTransactionAsync(task));
  queue = run.catch(() => undefined);
  return run;
}
