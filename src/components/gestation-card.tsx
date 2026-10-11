import { StyleSheet, Text, View } from 'react-native';

import type { Gestation } from '@/lib/gestation';
import { colors, fonts } from '@/theme';

type GestationCardProps = {
  gestation: Gestation;
  /** Título arriba de la edad gestacional (ej. "Edad gestacional hoy"). */
  title: string;
};

/** Edad gestacional en grande. Las fechas clave van aparte, en KeyDatesCard. */
export function GestationCard({ gestation, title }: GestationCardProps) {
  return (
    <View style={styles.card} accessible accessibilityLabel={`${title}: ${gestation.age}`}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.age}>{gestation.age}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  age: {
    fontFamily: fonts.monoBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    color: colors.ink,
  },
});
