import { StyleSheet, Text, View } from 'react-native';

import type { Gestation } from '@/lib/gestation';
import { colors, fonts } from '@/theme';

type GestationCardProps = {
  gestation: Gestation;
  /** Título arriba de la edad gestacional (ej. "Edad gestacional hoy"). */
  title: string;
};

/** Edad gestacional en grande: semanas y, debajo, los días si no son 0. */
export function GestationCard({ gestation, title }: GestationCardProps) {
  const { weeksLabel, daysLabel } = gestation;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${title}: ${weeksLabel}${daysLabel ? ` y ${daysLabel}` : ''}`}>
      <Text style={styles.title}>{title}</Text>
      <View>
        <Text style={styles.weeks}>{weeksLabel}</Text>
        {daysLabel ? <Text style={styles.days}>{daysLabel}</Text> : null}
      </View>
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
  weeks: {
    fontFamily: fonts.monoBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    color: colors.ink,
  },
  days: {
    fontFamily: fonts.monoMedium,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textSecondary,
  },
});
