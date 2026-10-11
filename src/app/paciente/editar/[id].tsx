import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { EMPTY_ECO } from '@/components/eco-fields';
import { EMPTY_PATIENT_FORM, PatientForm, type PatientFormValues } from '@/components/patient-form';
import { getPatient, updatePatient, type Patient } from '@/db/patients';
import { formatDecimal } from '@/lib/text';
import { useToast } from '@/providers/toast-provider';

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
  const [patient, setPatient] = useState<Patient | null>(null);
  const showToast = useToast();

  useEffect(() => {
    getPatient(db, Number(id)).then(setPatient);
  }, [db, id]);

  if (!patient) return null;

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
