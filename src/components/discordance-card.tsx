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
      {/* La tarjeta es informativa: con ecografía cargada, la FUM no se usa para datar. */}
      <Text style={styles.note}>Se usa la ecografía para el cálculo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
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
  note: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
