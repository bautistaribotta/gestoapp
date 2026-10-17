/** Registra un error solo en desarrollo: en producción no hay monitoreo todavía. */
export function logError(context: string, error: unknown) {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
}
