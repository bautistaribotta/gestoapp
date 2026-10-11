import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { EMPTY_PATIENT_FORM, PatientForm } from '@/components/patient-form';
import { insertPatient } from '@/db/patients';

type NewPatientParams = {
  name?: string;
  fum?: string;
  /** Ecografía cargada en Cálculo rápido. */
  ecoDate?: string;
  ecoWeeks?: string;
  ecoDays?: string;
};

export default function NewPatientScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<NewPatientParams>();

  return (
    <PatientForm
      mode="new"
      initialValues={{
        ...EMPTY_PATIENT_FORM,
        name: params.name ?? '',
        fum: params.fum ?? null,
        eco: {
          on: Boolean(params.ecoDate),
          date: params.ecoDate ?? null,
          weeks: params.ecoWeeks ?? '',
          days: params.ecoDays ?? '',
        },
      }}
      onSubmit={async (patient) => {
        const id = await insertPatient(db, patient);
        router.replace({ pathname: '/paciente/[id]', params: { id: String(id) } });
      }}
    />
  );
}
