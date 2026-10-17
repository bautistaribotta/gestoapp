import { scryptAsync } from '@noble/hashes/scrypt.js';
import { AESEncryptionKey, AESSealedData, aesDecryptAsync, aesEncryptAsync, getRandomBytes } from 'expo-crypto';

/**
 * Formato del archivo de copia: un JSON con los parámetros para derivar la clave y los datos
 * cifrados con AES-256-GCM. La clave sale de la contraseña con scrypt (la contraseña nunca se guarda).
 */
const FORMAT = 'gestograma-copia';
const VERSION = 1;

/**
 * Costo de scrypt. N = 2^14 es el mínimo «interactivo»: en el teléfono tarda unos segundos porque
 * Hermes no tiene JIT. Viaja en el archivo, así que se puede subir sin romper las copias viejas.
 */
const SCRYPT_PARAMS = { N: 2 ** 14, r: 8, p: 1 };
const SALT_BYTES = 16;
const KEY_BYTES = 32;

/** Contraseña mínima: el archivo puede terminar en la nube y alguien podría probar contraseñas. */
export const MIN_PASSWORD_LENGTH = 10;

type Envelope = {
  format: typeof FORMAT;
  version: typeof VERSION;
  createdAt: string;
  kdf: { name: 'scrypt'; N: number; r: number; p: number; salt: string };
  cipher: 'AES-256-GCM';
  data: string;
};

/** El archivo no es una copia de Gestograma o está dañado. */
export class InvalidBackupFileError extends Error {
  constructor(detail: string) {
    super(`Archivo de copia inválido: ${detail}`);
    this.name = 'InvalidBackupFileError';
  }
}

/** La contraseña no abre la copia (o el archivo fue modificado: GCM no distingue los dos casos). */
export class WrongPasswordError extends Error {
  constructor() {
    super('La contraseña no abre la copia');
    this.name = 'WrongPasswordError';
  }
}

// El JSON se escribe en ASCII (los acentos como \uXXXX) para pasar de texto a bytes sin depender
// de TextDecoder, que Hermes no trae en todas las versiones.
function asciiJson(value: unknown): string {
  return JSON.stringify(value).replace(
    /[\u007f-￿]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

function asciiToBytes(text: string): Uint8Array {
  return Uint8Array.from(text, (char) => char.charCodeAt(0));
}

function bytesToAscii(bytes: Uint8Array): string {
  let text = '';
  for (let start = 0; start < bytes.length; start += 8192) {
    text += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return text;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(bytesToAscii(bytes));
}

function base64ToBytes(base64: string): Uint8Array {
  return asciiToBytes(atob(base64));
}

/** Los parámetros del encabezado se autentican junto con los datos: no se pueden cambiar sin romperla. */
function headerData(envelope: Pick<Envelope, 'format' | 'version' | 'kdf'>): string {
  const { N, r, p, salt } = envelope.kdf;
  return bytesToBase64(asciiToBytes(`${envelope.format}|${envelope.version}|scrypt|${N}|${r}|${p}|${salt}`));
}

async function deriveKey(password: string, salt: Uint8Array, params: typeof SCRYPT_PARAMS) {
  const keyBytes = await scryptAsync(password.normalize('NFKC'), salt, {
    ...params,
    dkLen: KEY_BYTES,
  });
  return AESEncryptionKey.import(keyBytes);
}

/** Cifra los datos y devuelve el contenido del archivo de copia. */
export async function encryptBackup(data: unknown, password: string): Promise<string> {
  const salt = getRandomBytes(SALT_BYTES);
  const header: Pick<Envelope, 'format' | 'version' | 'kdf'> = {
    format: FORMAT,
    version: VERSION,
    kdf: { name: 'scrypt' as const, ...SCRYPT_PARAMS, salt: bytesToBase64(salt) },
  };
  const key = await deriveKey(password, salt, SCRYPT_PARAMS);
  const sealed = await aesEncryptAsync(asciiToBytes(asciiJson(data)), key, {
    additionalData: headerData(header),
  });
  const envelope: Envelope = {
    ...header,
    createdAt: new Date().toISOString(),
    cipher: 'AES-256-GCM',
    data: await sealed.combined('base64'),
  };
  return JSON.stringify(envelope, null, 2);
}

function parseEnvelope(fileText: string): Envelope {
  let value: unknown;
  try {
    value = JSON.parse(fileText);
  } catch {
    throw new InvalidBackupFileError('no es JSON');
  }
  if (typeof value !== 'object' || value === null) throw new InvalidBackupFileError('estructura');
  const envelope = value as Partial<Envelope>;
  if (envelope.format !== FORMAT) throw new InvalidBackupFileError('formato');
  if (envelope.version !== VERSION) throw new InvalidBackupFileError(`versión ${envelope.version}`);
  if (envelope.cipher !== 'AES-256-GCM' || typeof envelope.data !== 'string') {
    throw new InvalidBackupFileError('datos');
  }
  const kdf = envelope.kdf;
  // Límites para que un archivo manipulado no pida una derivación imposible de calcular.
  const validKdf =
    kdf?.name === 'scrypt' &&
    Number.isInteger(kdf.N) &&
    kdf.N >= 2 ** 10 &&
    kdf.N <= 2 ** 18 &&
    (kdf.N & (kdf.N - 1)) === 0 &&
    Number.isInteger(kdf.r) &&
    kdf.r >= 1 &&
    kdf.r <= 16 &&
    Number.isInteger(kdf.p) &&
    kdf.p >= 1 &&
    kdf.p <= 4 &&
    typeof kdf.salt === 'string';
  if (!validKdf) throw new InvalidBackupFileError('parámetros de la clave');
  return envelope as Envelope;
}

/** Valida el archivo sin la contraseña, para avisar antes de pedirla si no es una copia. */
export function checkBackupFile(fileText: string) {
  parseEnvelope(fileText);
}

/** Descifra el archivo de copia y devuelve los datos tal como se exportaron (sin validar). */
export async function decryptBackup(fileText: string, password: string): Promise<unknown> {
  const envelope = parseEnvelope(fileText);
  const { N, r, p, salt } = envelope.kdf;
  let sealed: AESSealedData;
  let saltBytes: Uint8Array;
  try {
    saltBytes = base64ToBytes(salt);
    sealed = AESSealedData.fromCombined(envelope.data);
  } catch {
    throw new InvalidBackupFileError('datos dañados');
  }
  const key = await deriveKey(password, saltBytes, { N, r, p });

  let plaintext: Uint8Array;
  try {
    plaintext = (await aesDecryptAsync(sealed, key, {
      output: 'bytes',
      additionalData: headerData(envelope),
    })) as Uint8Array;
  } catch {
    throw new WrongPasswordError();
  }

  try {
    return JSON.parse(bytesToAscii(plaintext));
  } catch {
    throw new InvalidBackupFileError('contenido');
  }
}
