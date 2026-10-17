/** Falla al abrir la base o al migrarla; la pantalla de error la distingue de un fallo de la interfaz. */
export class DatabaseError extends Error {
  constructor(cause: Error) {
    super(cause.message, { cause });
    this.name = 'DatabaseError';
  }
}

/** onError del SQLiteProvider: la relanza para que la tome el ErrorBoundary del layout raíz. */
export function rethrowAsDatabaseError(error: Error): never {
  throw error instanceof DatabaseError ? error : new DatabaseError(error);
}
