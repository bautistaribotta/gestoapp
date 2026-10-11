import type { SQLiteDatabase } from 'expo-sqlite';

export const PROFILE_TITLES = ['Dra.', 'Dr.', 'Sin título'] as const;

export type ProfileTitle = (typeof PROFILE_TITLES)[number];

export type Profile = {
  title: ProfileTitle;
  name: string;
};

const TITLE_KEY = 'profile_title';
const NAME_KEY = 'profile_name';

function isProfileTitle(value: string | undefined): value is ProfileTitle {
  return PROFILE_TITLES.some((title) => title === value);
}

export async function getProfile(db: SQLiteDatabase): Promise<Profile | null> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings WHERE key IN (?, ?)',
    TITLE_KEY,
    NAME_KEY,
  );
  const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const title = values[TITLE_KEY];
  const name = values[NAME_KEY];
  if (!name || !isProfileTitle(title)) return null;
  return { title, name };
}

export async function saveProfile(db: SQLiteDatabase, profile: Profile) {
  await db.withTransactionAsync(async () => {
    const upsert = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
    await db.runAsync(upsert, TITLE_KEY, profile.title);
    await db.runAsync(upsert, NAME_KEY, profile.name);
  });
}

export function greeting(profile: Profile | null): string {
  const name = profile?.name.trim();
  if (!profile || !name) return 'Hola';
  return profile.title === 'Sin título' ? `Hola, ${name}` : `Hola, ${profile.title} ${name}`;
}
