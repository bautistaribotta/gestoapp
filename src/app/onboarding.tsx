import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { TextField } from '@/components/field';
import { Logo } from '@/components/logo';
import { TitlePicker } from '@/components/title-picker';
import { greeting, type ProfileTitle } from '@/db/profile';
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
              <Logo />
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
            <TitlePicker value={title} onChange={setTitle} />

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
    // El dibujo deja aire a la izquierda; se corre para alinearlo con el texto, como en el diseño.
    marginLeft: -6,
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
  preview: {
    minHeight: 20,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
