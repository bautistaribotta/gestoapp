import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

/** Triángulo de alerta del design system (▲), dibujado con bordes. */
export function AlertTriangle({ size = 11 }: { size?: 11 | 12 }) {
  return <View style={[styles.triangle, size === 12 && styles.triangleLarge]} />;
}

/** Círculo vacío que acompaña a los estados concordantes (○). */
export function OkCircle() {
  return <View style={styles.circle} />;
}

const styles = StyleSheet.create({
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5.5,
    borderRightWidth: 5.5,
    borderBottomWidth: 10,
    borderLeftColor: colors.transparent,
    borderRightColor: colors.transparent,
    borderBottomColor: colors.alertText,
  },
  triangleLarge: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 11,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
});
