import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { DatabaseError } from '@/db/database-error';
import { getLegalAcceptance, legalAcceptanceEntries, type LegalAcceptance } from '@/db/legal';
import { getProfile, profileEntries, saveProfile, type Profile } from '@/db/profile';
import { setSettings } from '@/db/settings';
import { isoFromDay, todayDay } from '@/lib/dates';
import { LEGAL_VERSION } from '@/lib/legal';

type ProfileContextValue = {
  loading: boolean;
  profile: Profile | null;
  /** Aceptación de la versión vigente de los documentos legales, o null si falta. */
  legal: LegalAcceptance | null;
  /** Hay perfil y los documentos vigentes están aceptados: se puede usar la app. */
  ready: boolean;
  save: (profile: Profile) => Promise<void>;
  /** Cierra el onboarding: guarda el perfil y la aceptación juntos. */
  completeOnboarding: (profile: Profile) => Promise<void>;
  /** Muestra un perfil que ya se guardó en la base por otro camino (ej. al importar una copia). */
  showSavedProfile: (profile: Profile) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [acceptance, setAcceptance] = useState<LegalAcceptance | null>(null);
  const [loadError, setLoadError] = useState<DatabaseError | null>(null);

  useEffect(() => {
    Promise.all([getProfile(db), getLegalAcceptance(db)])
      .then(([storedProfile, storedAcceptance]) => {
        setProfile(storedProfile);
        setAcceptance(storedAcceptance);
      })
      .catch((error: unknown) => {
        setLoadError(new DatabaseError(error instanceof Error ? error : new Error(String(error))));
      })
      .finally(() => setLoading(false));
  }, [db]);

  // Sin poder leer el perfil no se sabe si falta el onboarding: en lugar de mandarlo ahí y que
  // se pise lo guardado, la falla pasa a la pantalla de error del layout raíz, con «Reintentar».
  if (loadError) throw loadError;

  const save = async (next: Profile) => {
    await saveProfile(db, next);
    setProfile(next);
  };

  const completeOnboarding = async (next: Profile) => {
    const nextAcceptance = { version: LEGAL_VERSION, acceptedAt: isoFromDay(todayDay()) };
    await setSettings(db, { ...profileEntries(next), ...legalAcceptanceEntries(nextAcceptance) });
    setProfile(next);
    setAcceptance(nextAcceptance);
  };

  // Una aceptación de una versión anterior no cuenta: se vuelve a pedir.
  const legal = acceptance?.version === LEGAL_VERSION ? acceptance : null;
  const ready = profile !== null && legal !== null;

  return (
    <ProfileContext
      value={{
        loading,
        profile,
        legal,
        ready,
        save,
        completeOnboarding,
        showSavedProfile: setProfile,
      }}>
      {children}
    </ProfileContext>
  );
}

export function useProfile() {
  const context = use(ProfileContext);
  if (!context) {
    throw new Error('useProfile debe usarse dentro de ProfileProvider');
  }
  return context;
}
