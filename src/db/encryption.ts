import { bytesToHex } from '@noble/hashes/utils.js';
import { getRandomBytes } from 'expo-crypto';
import { File } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { defaultDatabaseDirectory, openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

/** Base sin cifrar: la de versiones anteriores, y la que se usa en Expo Go (no trae SQLCipher). */
const PLAIN_DATABASE = 'gestoapp.db';
const ENCRYPTED_DATABASE = 'gestoapp-cifrada.db';
/** Destino temporal mientras se cifra la base vieja: si se corta a mitad, no queda una base a medias. */
const ENCRYPTING_DATABASE = 'gestoapp-cifrando.db';

/** La clave se guarda en el llavero de iOS / Keystore de Android, nunca junto a la base. */
const KEY_ITEM = 'gestoapp.database-key';
const KEY_BYTES = 32;

export type DatabaseConfig = {
  databaseName: string;
  /** Clave en hexadecimal, o null si la base no se cifra (Expo Go). */
  key: string | null;
};

function databasePath(name: string) {
  return `${defaultDatabaseDirectory}/${name}`;
}

function databaseFile(name: string, suffix = '') {
  return new File(`file://${databasePath(name)}${suffix}`);
}

/** Borra la base con sus archivos auxiliares del modo WAL. */
function deleteDatabaseFiles(name: string) {
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    const file = databaseFile(name, suffix);
    if (file.exists) file.delete();
  }
}

/** Clave cruda (x'…'): SQLCipher la usa directo, sin derivarla, así que abrir la base es instantáneo. */
function keyClause(key: string) {
  return `"x'${key}'"`;
}

/** Debe ser lo primero que se ejecuta en una conexión a la base cifrada. */
export async function applyDatabaseKey(db: SQLiteDatabase, key: string) {
  await db.execAsync(`PRAGMA key = ${keyClause(key)}`);
}

async function supportsSQLCipher() {
  const db = await openDatabaseAsync(':memory:', { useNewConnection: true });
  try {
    const row = await db.getFirstAsync<{ cipher_version?: string }>('PRAGMA cipher_version');
    return Boolean(row?.cipher_version);
  } finally {
    await db.closeAsync();
  }
}

/** Copia la base sin cifrar de versiones anteriores a una cifrada y borra la vieja. */
async function encryptPlainDatabase(key: string) {
  deleteDatabaseFiles(ENCRYPTING_DATABASE);
  const plain = await openDatabaseAsync(PLAIN_DATABASE, { useNewConnection: true });
  try {
    const row = await plain.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    // sqlcipher_export copia las tablas y los datos, pero no la versión: se pasa a mano.
    await plain.execAsync(`
      ATTACH DATABASE '${databasePath(ENCRYPTING_DATABASE)}' AS cifrada KEY ${keyClause(key)};
      SELECT sqlcipher_export('cifrada');
      PRAGMA cifrada.user_version = ${row?.user_version ?? 0};
      DETACH DATABASE cifrada;
    `);
  } finally {
    await plain.closeAsync();
  }
  databaseFile(ENCRYPTING_DATABASE).move(databaseFile(ENCRYPTED_DATABASE));
  deleteDatabaseFiles(PLAIN_DATABASE);
}

/**
 * Decide qué base abrir antes de montar el SQLiteProvider. Con SQLCipher (development build y
 * producción) usa la base cifrada y crea la clave la primera vez; en Expo Go sigue con la base sin cifrar.
 */
export async function prepareDatabase(): Promise<DatabaseConfig> {
  if (!(await supportsSQLCipher())) {
    return { databaseName: PLAIN_DATABASE, key: null };
  }

  let key = await SecureStore.getItemAsync(KEY_ITEM);
  if (!key) {
    // Una base cifrada sin su clave (por ejemplo, restaurada en otro teléfono) no se puede abrir:
    // se descarta y se empieza de cero. Los datos se recuperan importando una copia exportada.
    deleteDatabaseFiles(ENCRYPTED_DATABASE);
    key = bytesToHex(getRandomBytes(KEY_BYTES));
    await SecureStore.setItemAsync(KEY_ITEM, key);
  }

  deleteDatabaseFiles(ENCRYPTING_DATABASE);
  if (!databaseFile(ENCRYPTED_DATABASE).exists && databaseFile(PLAIN_DATABASE).exists) {
    await encryptPlainDatabase(key);
  }
  return { databaseName: ENCRYPTED_DATABASE, key };
}
