import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { TextField } from '@/components/field';
import { ScreenHeader } from '@/components/screen-header';
import { TitlePicker } from '@/components/title-picker';
import { greeting, type ProfileTitle } from '@/db/profile';
import { dayFromIso, formatDay } from '@/lib/dates';
import { LEGAL_DOC_IDS, LEGAL_DOCS } from '@/lib/legal';
import { useProfile } from '@/providers/profile-provider';
import { useToast } from '@/providers/toast-provider';
import { colors, fonts } from '@/theme';

/** Perfil: el título y el nombre con los que se saluda en Inicio, y los documentos legales. */
export default function ProfileScreen() {
  const { profile, legal, save } = useProfile();
  const showToast = useToast();
  const [title, setTitle] = useState<ProfileTitle>(profile?.title ?? 'Dra.');
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const changed = title !== profile?.title || trimmedName !== profile?.name.trim();
  const valid = changed && trimmedName.length > 0;
  const canSave = valid && !saving;

  const acceptedDay = dayFromIso(legal?.acceptedAt);

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await save({ title, name: trimmedName });
      router.back();
      showToast({ message: 'Tus datos se actualizaron', placement: 'tabBar' });
    } catch {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Perfil" backLabel="Cancelar" backChevron={false} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <TitlePicker value={title} onChange={setTitle} />

          <TextField
            label="Apellido o nombre"
            value={name}
            onChangeText={setName}
            placeholder="Ej.: Martínez"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
            error={trimmedName ? null : 'Escribí cómo querés que te llamemos.'}
          />

          <View style={styles.preview} accessible>
            <Text style={styles.previewLabel}>Así te saludamos en Inicio</Text>
            <Text style={styles.previewGreeting}>
              {greeting({ title, name: trimmedName })}
            </Text>
          </View>

          <View style={styles.legal}>
            <Text style={styles.sectionLabel} accessibilityRole="header">
              Legal
            </Text>
            <View style={styles.legalList}>
              {LEGAL_DOC_IDS.map((id, index) => {
                const doc = LEGAL_DOCS[id];
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={`${doc.name}. Actualizado el ${doc.updated}`}
                    onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: id } })}
                    style={({ pressed }) => [
                      styles.legalRow,
                      index > 0 && styles.legalRowDivider,
                      pressed && styles.legalRowPressed,
                    ]}>
                    <View style={styles.legalText}>
                      <Text style={styles.legalName}>{doc.name}</Text>
                      <Text style={styles.legalUpdated}>Actualizado el {doc.updated}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                );
              })}
            </View>
            {acceptedDay !== null ? (
              <Text style={styles.accepted}>
                Aceptaste ambos documentos el {formatDay(acceptedDay)}.
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Button
            label="Guardar cambios"
            size="lg"
            disabled={!valid}
            loading={saving}
            onPress={submit}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  preview: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 4,
  },
  previewLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  previewGreeting: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  legal: {
    marginTop: 8,
    gap: 6,
  },
  sectionLabel: {
    paddingHorizontal: 4,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textMuted,
  },
  legalList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  legalRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  legalRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.sunken,
  },
  legalRowPressed: {
    backgroundColor: colors.sunken,
  },
  legalText: {
    flex: 1,
    gap: 2,
  },
  legalName: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  legalUpdated: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  chevron: {
    fontFamily: fonts.regular,
    fontSize: 20,
    color: colors.textMuted,
  },
  accepted: {
    paddingHorizontal: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.textMuted,
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
