import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/theme';

type BackButtonProps = {
  label?: string;
  /** Muestra la flecha «‹». Se oculta para acciones como «Cancelar». */
  chevron?: boolean;
  /** Por defecto vuelve a la pantalla anterior (o a Inicio si no hay historial). */
  onPress?: () => void;
};

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export function BackButton({ label = 'Atrás', chevron = true, onPress = goBack }: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {chevron ? <Text style={styles.chevron}>‹</Text> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  chevron: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    lineHeight: 26,
    color: colors.ink,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
});
