import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { LegalConsentCard } from '@/components/legal-consent-card';
import { ScreenHeader } from '@/components/screen-header';
import { isProfileTitle } from '@/db/profile';
import { LEGAL_DOC_IDS, LEGAL_DOCS, type LegalDocId } from '@/lib/legal';
import { useProfile } from '@/providers/profile-provider';
import { colors, fonts } from '@/theme';

type DocFlags = Record<LegalDocId, boolean>;

const NONE: DocFlags = { terminos: false, privacidad: false };

/** Paso 2 del onboarding: abrir y aceptar los Términos y la Política de Privacidad. */
export default function OnboardingLegalScreen() {
  const params = useLocalSearchParams<{ title?: string; name?: string }>();
  const { completeOnboarding } = useProfile();
  const [read, setRead] = useState<DocFlags>(NONE);
  const [accepted, setAccepted] = useState<DocFlags>(NONE);
  const [saving, setSaving] = useState(false);

  const title = isProfileTitle(params.title) ? params.title : null;
  const name = params.name?.trim() ?? '';
  const valid = title !== null && name.length > 0;
  const allAccepted = LEGAL_DOC_IDS.every((id) => accepted[id]);

  // Abrir un documento lo marca como leído y aceptado; la casilla se puede desmarcar después.
  const open = (id: LegalDocId) => {
    setRead((current) => ({ ...current, [id]: true }));
    setAccepted((current) => ({ ...current, [id]: true }));
    router.push({ pathname: '/legal/[doc]', params: { doc: id, desde: 'onboarding' } });
  };

  const toggle = (id: LegalDocId) => {
    setAccepted((current) => ({ ...current, [id]: !current[id] }));
  };

  const finish = async () => {
    if (!valid || !allAccepted || saving) return;
    setSaving(true);
    try {
      // Al guardar, el layout raíz habilita Inicio y redirige solo.
      await completeOnboarding({ title, name });
    } catch {
      setSaving(false);
    }
  };

  // Sin los datos del paso 1 (por ejemplo, al abrir un enlace directo) se vuelve a empezar.
  if (!valid) return <Redirect href="/" />;

  return (
    <View style={styles.screen}>
      <ScreenHeader />

      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.brand}>GESTOGRAMA · PASO 2 DE 2</Text>
          <Text style={styles.heading} accessibilityRole="header">
            Antes de empezar
          </Text>
          <Text style={styles.lead}>
            Abrí cada documento para poder aceptarlo. Podés volver a leerlos cuando quieras desde
            tu perfil.
          </Text>
        </View>

        {LEGAL_DOC_IDS.map((id) => (
          <LegalConsentCard
            key={id}
            doc={LEGAL_DOCS[id]}
            read={read[id]}
            accepted={accepted[id]}
            onOpen={() => open(id)}
            onToggle={() => toggle(id)}
          />
        ))}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Text style={styles.consent}>
          Al continuar, aceptás los Términos y Condiciones y la Política de Privacidad.
        </Text>
        <Button
          label="Aceptar y continuar"
          size="lg"
          disabled={!allAccepted}
          loading={saving}
          onPress={finish}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 20,
  },
  intro: {
    gap: 10,
  },
  brand: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
    color: colors.ink,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 12,
  },
  consent: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
