import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { DeletePatientSheet } from '@/components/delete-patient-sheet';
import { DiscordanceCard } from '@/components/discordance-card';
import { GestationCard } from '@/components/gestation-card';
import { LoadingState } from '@/components/heartbeat';
import { KeyDatesCard } from '@/components/key-dates-card';
import { NoteCard } from '@/components/note-card';
import { ScreenHeader } from '@/components/screen-header';
import {
  deletePatient,
  getPatient,
  restorePatient,
  updatePatientNote,
  type Patient,
} from '@/db/patients';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { dayFromIso, seenLabel, todayDay } from '@/lib/dates';
import {
  datingReference,
  discordance,
  fumError,
  gestationFromReference,
  keyDates,
} from '@/lib/gestation';
import { formatDecimal } from '@/lib/text';
import { useToast } from '@/providers/toast-provider';
import { colors, fonts } from '@/theme';

export default function PatientScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const showLoading = useDelayedFlag(patient === undefined);
  const showToast = useToast();

  const load = useCallback(() => {
    getPatient(db, Number(id)).then(setPatient);
  }, [db, id]);

  // Recarga al volver de «Editar datos».
  useFocusEffect(load);

  const saveNote = async (note: string) => {
    if (!patient) return;
    await updatePatientNote(db, patient.id, note);
    load();
    showToast({ message: patient.note ? 'Nota actualizada' : 'Nota guardada' });
  };

  const remove = async () => {
    if (!patient) return;
    setConfirmDelete(false);
    await deletePatient(db, patient.id);
    router.back();
    showToast({
      message: `${patient.name} eliminada`,
      placement: 'tabBar',
      onUndo: () => restorePatient(db, patient),
    });
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        backLabel="Inicio"
        right={
          patient ? (
            <Button
              label="Editar datos"
              variant="outline"
              size="sm"
              onPress={() =>
                router.push({
                  pathname: '/paciente/editar/[id]',
                  params: { id: String(patient.id) },
                })
              }
            />
          ) : null
        }
      />
      {patient === null ? (
        <Text style={[styles.empty, styles.notFound]}>No encontramos esta paciente.</Text>
      ) : patient ? (
        <>
          <PatientDetail
            patient={patient}
            onSaveNote={saveNote}
            onDelete={() => setConfirmDelete(true)}
          />
          <DeletePatientSheet
            visible={confirmDelete}
            name={patient.name}
            onConfirm={remove}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      ) : showLoading ? (
        <LoadingState label="Cargando paciente…" />
      ) : null}
    </View>
  );
}

type PatientDetailProps = {
  patient: Patient;
  onSaveNote: (note: string) => Promise<void>;
  onDelete: () => void;
};

function PatientDetail({ patient, onSaveNote, onDelete }: PatientDetailProps) {
  const today = todayDay();
  const reference = datingReference(patient, today);
  const gestation = reference ? gestationFromReference(reference.day, today) : null;
  const comparison = discordance(patient, today);
  const { weight, heightCm } = patient;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.identity}>
            <Avatar name={patient.name} size="lg" />
            <View style={styles.identityText}>
              <Text style={styles.name} accessibilityRole="header">
                {patient.name}
              </Text>
              <Text style={styles.meta}>
                Vista {seenLabel(dayFromIso(patient.lastSeen) ?? today, today).toLowerCase()}
              </Text>
            </View>
          </View>
          <View style={styles.stats}>
            <Stat label="Peso" value={weight ? `${formatDecimal(weight)} kg` : '—'} />
            <Stat label="Altura" value={heightCm ? `${Math.round(heightCm)} cm` : '—'} />
            <Stat label="Edad" value={patient.age ? `${patient.age} años` : '—'} />
          </View>
        </View>

        {gestation && reference ? (
          <>
            <GestationCard gestation={gestation} title="Edad gestacional hoy" />
            {comparison ? <DiscordanceCard discordance={comparison} /> : null}
            <KeyDatesCard dates={keyDates(reference)} />
          </>
        ) : (
          <Text style={styles.empty}>
            {reference?.source === 'eco'
              ? 'La edad gestacional por ecografía supera las 42 semanas.'
              : (fumError(patient.fum, today) ??
                'Sin FUM ni ecografía cargadas. Podés cargarlas desde «Editar datos».')}
          </Text>
        )}

        <NoteCard note={patient.note} updatedAt={patient.noteUpdatedAt} onSave={onSaveNote} />

        <View style={styles.deleteAction}>
          <Button label="Eliminar paciente" variant="danger" onPress={onDelete} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
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
  empty: {
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
  deleteAction: {
    marginTop: 8,
  },
});
