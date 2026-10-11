import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { getProfile, saveProfile, type Profile } from '@/db/profile';

type ProfileContextValue = {
  loading: boolean;
  profile: Profile | null;
  save: (profile: Profile) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile(db)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [db]);

  const save = async (next: Profile) => {
    await saveProfile(db, next);
    setProfile(next);
  };

  return <ProfileContext value={{ loading, profile, save }}>{children}</ProfileContext>;
}

export function useProfile() {
  const context = use(ProfileContext);
  if (!context) {
    throw new Error('useProfile debe usarse dentro de ProfileProvider');
  }
  return context;
}
