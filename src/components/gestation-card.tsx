import { StyleSheet, Text, View } from 'react-native';

import type { Gestation } from '@/lib/gestation';
import { colors, fonts } from '@/theme';

type GestationCardProps = {
  gestation: Gestation;
  /** Título opcional arriba de la edad gestacional (ej. "Edad gestacional hoy"). */
  title?: string;
  /** Muestra el mes aproximado y el trimestre. */
  detailed?: boolean;
  /** Referencia usada para el cálculo (ej. "ecografía 20/05/2026"). */
  reference?: string;
};

export function GestationCard({ gestation, title, detailed, reference }: GestationCardProps) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.ageRow}>
        <Text style={styles.age}>{gestation.age}</Text>
        {detailed ? <Text style={styles.month}>{gestation.month}</Text> : null}
      </View>
      {detailed || reference ? (
        <View style={styles.chips}>
          {detailed ? (
            <View style={styles.trimester}>
              <View style={styles.trimesterBars}>
                {Array.from({ length: gestation.trimester }, (_, index) => (
                  <View key={index} style={styles.trimesterBar} />
                ))}
              </View>
              <Text style={styles.trimesterLabel}>{gestation.trimesterLabel}</Text>
            </View>
          ) : null}
          {reference ? <Text style={styles.reference}>Ref.: {reference}</Text> : null}
        </View>
      ) : null}
      <View style={styles.dueDateRow}>
        <Text style={styles.dueDateLabel}>FPP</Text>
        <Text style={styles.dueDate}>{gestation.dueDate}</Text>
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
    gap: 12,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  age: {
    fontFamily: fonts.monoBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    color: colors.ink,
  },
  month: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  reference: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  trimester: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  trimesterBars: {
    flexDirection: 'row',
    gap: 2,
  },
  trimesterBar: {
    width: 3,
    height: 10,
    borderRadius: 1,
    backgroundColor: colors.accentText,
  },
  trimesterLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.accentText,
  },
  dueDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.sunken,
    paddingTop: 12,
  },
  dueDateLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  dueDate: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    color: colors.ink,
  },
});
