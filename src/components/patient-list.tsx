import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import type { Patient } from '@/db/patients';
import { dayFromIso, seenLabel } from '@/lib/dates';
import { colors, fonts } from '@/theme';

const GROUP_TITLES = ['Hoy', 'Esta semana', 'Este mes', 'Antes'] as const;

function groupIndex(daysAgo: number) {
  if (daysAgo <= 0) return 0;
  if (daysAgo < 7) return 1;
  if (daysAgo < 31) return 2;
  return 3;
}

type PatientListProps = {
  /** Pacientes ordenadas de la vista más reciente a la más antigua. */
  patients: Patient[];
  today: number;
  onOpen: (patient: Patient) => void;
};

/** Listado agrupado por la última vez que se vio a cada paciente. */
export function PatientList({ patients, today, onOpen }: PatientListProps) {
  const groups: Patient[][] = GROUP_TITLES.map(() => []);
  for (const patient of patients) {
    groups[groupIndex(today - (dayFromIso(patient.lastSeen) ?? today))].push(patient);
  }

  return (
    <View style={styles.list}>
      {groups.map((items, index) =>
        items.length ? (
          <View key={GROUP_TITLES[index]} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{GROUP_TITLES[index]}</Text>
              <Text style={styles.groupCount}>{items.length}</Text>
            </View>
            <View style={styles.card}>
              {items.map((patient, position) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  seen={seenLabel(dayFromIso(patient.lastSeen) ?? today, today)}
                  first={position === 0}
                  onPress={() => onOpen(patient)}
                />
              ))}
            </View>
          </View>
        ) : null,
      )}
    </View>
  );
}

type PatientRowProps = {
  patient: Patient;
  seen: string;
  first: boolean;
  onPress: () => void;
};

function PatientRow({ patient, seen, first, onPress }: PatientRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${patient.name}, ${patient.age} años, vista ${seen.toLowerCase()}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !first && styles.rowDivider, pressed && styles.rowPressed]}>
      <Avatar name={patient.name} />
      <View style={styles.rowBody}>
        <Text style={styles.name} numberOfLines={1}>
          {patient.name}
        </Text>
        <Text style={styles.age}>{patient.age} años</Text>
      </View>
      <Text style={styles.seen}>{seen}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
  group: {
    gap: 6,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  groupTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  groupCount: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.sunken,
  },
  rowPressed: {
    backgroundColor: colors.sunken,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  age: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  seen: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
