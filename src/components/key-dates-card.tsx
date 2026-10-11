import { StyleSheet, Text, View } from 'react-native';

import { formatMediumDay, weekdayName } from '@/lib/dates';
import type { KeyDate } from '@/lib/gestation';
import { colors, fonts } from '@/theme';

/** Lista de fechas clave del embarazo: FUM, concepción, trimestres y FPP. */
export function KeyDatesCard({ dates }: { dates: KeyDate[] }) {
  return (
    <View style={styles.card}>
      {dates.map((item, index) => (
        <View
          key={item.label}
          style={[styles.row, index > 0 && styles.rowDivider]}
          accessible
          accessibilityLabel={`${item.label}: ${weekdayName(item.day)} ${formatMediumDay(item.day)}`}>
          <View style={styles.text}>
            <Text style={styles.label}>{item.label}</Text>
            {item.sub ? <Text style={styles.sub}>{item.sub}</Text> : null}
          </View>
          <View style={styles.value}>
            <Text style={styles.date}>{formatMediumDay(item.day)}</Text>
            <Text style={styles.weekday}>{weekdayName(item.day)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  row: {
    minHeight: 60,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.sunken,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMuted,
  },
  value: {
    alignItems: 'flex-end',
    gap: 2,
  },
  date: {
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: colors.ink,
  },
  weekday: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
