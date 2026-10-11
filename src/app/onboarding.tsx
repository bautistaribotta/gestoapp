import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FieldLabel, TextField } from '@/components/field';
import { greeting, PROFILE_TITLES, type ProfileTitle } from '@/db/profile';
import { useProfile } from '@/providers/profile-provider';
import { colors, fonts } from '@/theme';

export default function OnboardingScreen() {
  const { save } = useProfile();
  const [title, setTitle] = useState<ProfileTitle>('Dra.');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const canFinish = trimmedName.length > 0 && !saving;

  const finish = async () => {
    if (!canFinish) return;
    setSaving(true);
    try {
      // Al guardar el perfil, el layout raíz habilita Inicio y redirige solo.
      await save({ title, name: trimmedName });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <View style={styles.logo}>
              <View style={styles.logoTick} />
            </View>
            <Text style={styles.brand}>GESTOGRAMA</Text>
            <Text style={styles.heading} accessibilityRole="header">
              ¿Cómo querés que te llamemos?
            </Text>
            <Text style={styles.lead}>
              Lo usamos solo para saludarte en Inicio. Podés cambiarlo después.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.titleField}>
              <FieldLabel label="Tratamiento" />
              <View style={styles.segmented} accessibilityRole="radiogroup">
                {PROFILE_TITLES.map((option) => {
                  const selected = option === title;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => setTitle(option)}
                      style={[styles.segment, selected && styles.segmentSelected]}>
                      <Text style={styles.segmentLabel}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <TextField
              label="Apellido o nombre"
              value={name}
              onChangeText={setName}
              placeholder="Ej.: Martínez"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={finish}
            />

            <Text style={styles.preview}>
              {trimmedName ? `Vas a ver: «${greeting({ title, name: trimmedName })}»` : ''}
            </Text>
          </View>

          <View style={styles.flex} />

          <Button label="Continuar" size="lg" disabled={!canFinish} onPress={finish} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 28,
  },
  intro: {
    gap: 10,
    marginTop: 40,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  logoTick: {
    position: 'absolute',
    left: 17,
    top: -3,
    width: 3,
    height: 16,
    backgroundColor: colors.ink,
  },
  brand: {
    marginTop: 8,
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
  form: {
    gap: 16,
  },
  titleField: {
    gap: 6,
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: colors.sunken,
    borderRadius: 12,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.surface,
    boxShadow: [{ offsetX: 0, offsetY: 1, blurRadius: 2, color: colors.shadow }],
  },
  segmentLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  preview: {
    minHeight: 20,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
