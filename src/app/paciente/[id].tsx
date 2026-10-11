import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { DiscordanceCard } from '@/components/discordance-card';
import { GestationCard } from '@/components/gestation-card';
import { ScreenHeader } from '@/components/screen-header';
import { getPatient, type Patient } from '@/db/patients';
import { dayFromIso, seenLabel, todayDay } from '@/lib/dates';
import {
  datingReference,
  discordance,
  fumError,
  gestationFromReference,
} from '@/lib/gestation';
import { formatDecimal } from '@/lib/text';
import { colors, fonts } from '@/theme';

export default function PatientScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null | undefined>(undefined);

  useEffect(() => {
    getPatient(db, Number(id)).then(setPatient);
  }, [db, id]);

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      {patient === null ? (
        <Text style={[styles.note, styles.notFound]}>No encontramos esta paciente.</Text>
      ) : patient ? (
        <PatientDetail patient={patient} />
      ) : null}
    </View>
  );
}

function PatientDetail({ patient }: { patient: Patient }) {
  const today = todayDay();
  const reference = datingReference(patient, today);
  const gestation = reference ? gestationFromReference(reference.day, today) : null;
  const comparison = discordance(patient, today);
  const { weight, heightCm } = patient;
  const bmi = weight && heightCm ? weight / (heightCm / 100) ** 2 : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.identity}>
          <Avatar name={patient.name} size="lg" />
          <View style={styles.identityText}>
            <Text style={styles.name} accessibilityRole="header">
              {patient.name}
            </Text>
            <Text style={styles.meta}>
              {patient.age} años · vista{' '}
              {seenLabel(dayFromIso(patient.lastSeen) ?? today, today).toLowerCase()}
            </Text>
          </View>
        </View>
        <View style={styles.stats}>
          <Stat label="Peso" value={weight ? `${formatDecimal(weight)} kg` : '—'} />
          <Stat label="Altura" value={heightCm ? `${Math.round(heightCm)} cm` : '—'} />
          <Stat label="IMC" value={bmi ? formatDecimal(bmi, 1) : '—'} />
        </View>
      </View>

      {gestation && reference ? (
        <GestationCard
          gestation={gestation}
          title="Edad gestacional hoy"
          reference={reference.label}
          detailed
        />
      ) : (
        <Text style={styles.note}>
          {fumError(patient.fum, today) ??
            'Sin FUM ni ecografía cargadas. La ficha completa (datos y gestograma) sigue el diseño del sistema.'}
        </Text>
      )}

      {comparison ? <DiscordanceCard discordance={comparison} /> : null}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identityText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  statValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: colors.ink,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    backgroundColor: colors.sunken,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  notFound: {
    marginHorizontal: 16,
  },
});
