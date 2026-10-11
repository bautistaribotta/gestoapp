import { StyleSheet, Text, View } from 'react-native';

import { AlertTriangle, OkCircle } from '@/components/alert-icons';
import type { Discordance } from '@/lib/gestation';
import { colors, fonts } from '@/theme';

/** Comparación FUM / ecografía con el umbral ACOG. En ladrillo cuando hay discordancia. */
export function DiscordanceCard({ discordance }: { discordance: Discordance }) {
  const { over } = discordance;

  return (
    <View style={[styles.card, over && styles.cardOver]} accessibilityRole={over ? 'alert' : undefined}>
      <View style={styles.titleRow}>
        {over ? <AlertTriangle size={12} /> : <OkCircle />}
        <Text style={[styles.title, over && styles.titleOver]}>{discordance.title}</Text>
      </View>
      <View style={styles.values}>
        <View style={styles.value}>
          <Text style={styles.valueLabel}>Por FUM</Text>
          <Text style={styles.valueFum}>{discordance.gaFum}</Text>
        </View>
        <View style={styles.value}>
          <Text style={styles.valueLabel}>Por ecografía · en uso</Text>
          <Text style={styles.valueEco}>{discordance.gaEco}</Text>
        </View>
      </View>
      <Text style={styles.rule}>{discordance.rule}</Text>
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
  cardOver: {
    backgroundColor: colors.alertSoft,
    borderColor: colors.alertBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  titleOver: {
    color: colors.alertText,
  },
  values: {
    flexDirection: 'row',
    gap: 8,
  },
  value: {
    flex: 1,
  },
  valueLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  valueFum: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    color: colors.ink,
  },
  valueEco: {
    fontFamily: fonts.monoBold,
    fontSize: 17,
    color: colors.ink,
  },
  rule: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
