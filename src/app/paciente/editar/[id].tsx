import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EMPTY_ECO } from '@/components/eco-fields';
import { LoadingState } from '@/components/heartbeat';
import { LoadError } from '@/components/load-error';
import { EMPTY_PATIENT_FORM, PatientForm, type PatientFormValues } from '@/components/patient-form';
import { ScreenHeader } from '@/components/screen-header';
import { getPatient, updatePatient, type Patient } from '@/db/patients';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { logError } from '@/lib/log';
import { formatDecimal } from '@/lib/text';
import { useToast } from '@/providers/toast-provider';
import { colors } from '@/theme';

function formValuesFrom(patient: Patient): PatientFormValues {
  const { ecoDate, ecoGaDays } = patient;
  return {
    ...EMPTY_PATIENT_FORM,
    name: patient.name,
    age: patient.age ? String(patient.age) : '',
    weight: patient.weight ? formatDecimal(patient.weight) : '',
    heightCm: patient.heightCm ? String(Math.round(patient.heightCm)) : '',
    fum: patient.fum,
    eco:
      ecoDate && ecoGaDays
        ? {
            on: true,
            date: ecoDate,
            weeks: String(Math.floor(ecoGaDays / 7)),
            days: String(ecoGaDays % 7),
          }
        : EMPTY_ECO,
  };
}

export default function EditPatientScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  // undefined: cargando; null: no existe.
  const [patient, setPatient] = useState<Patient | null | undefined>(undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const showLoading = useDelayedFlag(patient === undefined && !loadFailed);
  const showToast = useToast();

  const load = useCallback(() => {
    getPatient(db, Number(id)).then(setPatient, (error: unknown) => {
      logError('Cargar paciente para editar', error);
      setLoadFailed(true);
    });
  }, [db, id]);

  useEffect(load, [load]);

  if (patient) {
    return (
      <PatientForm
        mode="edit"
        initialValues={formValuesFrom(patient)}
        onSubmit={async (data) => {
          await updatePatient(db, patient.id, data);
          router.back();
          showToast({ message: 'Datos de la paciente actualizados' });
        }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Editar paciente" backLabel="Cancelar" backChevron={false} />
      {patient === null ? (
        <LoadError title="No encontramos esta paciente" />
      ) : loadFailed ? (
        <LoadError
          title="No pudimos cargar la paciente"
          onRetry={() => {
            setLoadFailed(false);
            load();
          }}
        />
      ) : showLoading ? (
        <LoadingState label="Cargando paciente…" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
