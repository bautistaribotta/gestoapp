import type { SQLiteDatabase } from 'expo-sqlite';

import { getSettings, setSettings } from './settings';

export const PROFILE_TITLES = ['Dra.', 'Dr.', 'Sin título'] as const;

export type ProfileTitle = (typeof PROFILE_TITLES)[number];

export type Profile = {
  title: ProfileTitle;
  name: string;
};

const TITLE_KEY = 'profile_title';
const NAME_KEY = 'profile_name';

export function isProfileTitle(value: unknown): value is ProfileTitle {
  return PROFILE_TITLES.some((title) => title === value);
}

export async function getProfile(db: SQLiteDatabase): Promise<Profile | null> {
  const values = await getSettings(db, [TITLE_KEY, NAME_KEY]);
  const title = values[TITLE_KEY];
  const name = values[NAME_KEY];
  if (!name || !isProfileTitle(title)) return null;
  return { title, name };
}

export function profileEntries(profile: Profile): Record<string, string> {
  return { [TITLE_KEY]: profile.title, [NAME_KEY]: profile.name };
}

export async function saveProfile(db: SQLiteDatabase, profile: Profile) {
  await setSettings(db, profileEntries(profile));
}

export function greeting(profile: Profile | null): string {
  const name = profile?.name.trim();
  if (!profile || !name) return 'Hola';
  return profile.title === 'Sin título' ? `Hola, ${name}` : `Hola, ${profile.title} ${name}`;
}
