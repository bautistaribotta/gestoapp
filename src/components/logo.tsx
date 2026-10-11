import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

/**
 * Logo «Cuna» (f1 del design system), a 56 px. Se dibuja sobre una caja de 100 unidades
 * escalada a 0,56: la cuna es medio disco de radio 32 bajo y=52 y el bebé un círculo de
 * radio 11 en (36, 40).
 */
export function Logo() {
  return (
    <View style={styles.box} accessible accessibilityRole="image" accessibilityLabel="Gestograma">
      <View style={styles.cradle} />
      <View style={styles.baby} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 56,
    height: 56,
  },
  cradle: {
    position: 'absolute',
    left: 10.08,
    top: 29.12,
    width: 35.84,
    height: 17.92,
    borderBottomLeftRadius: 17.92,
    borderBottomRightRadius: 17.92,
    backgroundColor: colors.ink,
  },
  baby: {
    position: 'absolute',
    left: 14,
    top: 16.24,
    width: 12.32,
    height: 12.32,
    borderRadius: 6.16,
    backgroundColor: colors.logoAccent,
  },
});
