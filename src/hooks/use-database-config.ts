import type { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';

import { DatabaseError } from '@/db/database-error';
import { applyDatabaseKey, prepareDatabase, type DatabaseConfig } from '@/db/encryption';
import { migrateDbIfNeeded } from '@/db/migrations';

/**
 * Prepara la base (cifrada si el build trae SQLCipher) y devuelve el nombre y el onInit para el
 * SQLiteProvider, o null mientras tanto. Si falla, la pantalla de error del layout ofrece reintentar.
 */
export function useDatabaseConfig() {
  const [config, setConfig] = useState<DatabaseConfig | null>(null);
  const [error, setError] = useState<DatabaseError | null>(null);

  useEffect(() => {
    prepareDatabase().then(setConfig, (cause: unknown) => {
      setError(new DatabaseError(cause instanceof Error ? cause : new Error(String(cause))));
    });
  }, []);

  // La clave va antes que cualquier otra consulta: si no, SQLCipher no puede leer la base.
  const onInit = useMemo(() => {
    if (!config) return null;
    return async (db: SQLiteDatabase) => {
      if (config.key) await applyDatabaseKey(db, config.key);
      await migrateDbIfNeeded(db);
    };
  }, [config]);

  if (error) throw error;
  return config && onInit ? { databaseName: config.databaseName, onInit } : null;
}
