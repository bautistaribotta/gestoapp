import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { EmptyPatients } from '@/components/empty-patients';
import { LoadingState } from '@/components/heartbeat';
import { PatientList } from '@/components/patient-list';
import { SearchField } from '@/components/search-field';
import { listPatients, onPatientsChanged, type Patient } from '@/db/patients';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { todayDay } from '@/lib/dates';
import { normalizeForSearch } from '@/lib/text';
import { colors, fonts } from '@/theme';

export default function PatientsScreen() {
  const db = useSQLiteContext();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const showLoading = useDelayedFlag(patients === null);

  const load = useCallback(async () => {
    setPatients(await listPatients(db));
  }, [db]);

  // La base es local y responde al instante: se deja el indicador un momento para que el gesto tenga respuesta.
  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_MS))]);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  // Recarga aunque Inicio ya esté visible, por ejemplo al deshacer una eliminación.
  useEffect(
    () =>
      onPatientsChanged(() => {
        load();
      }),
    [load],
  );

  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeForSearch(trimmedQuery);
  const visible = (patients ?? []).filter(
    (patient) => !normalizedQuery || normalizeForSearch(patient.name).includes(normalizedQuery),
  );

  const openNew = (name?: string) =>
    router.push({ pathname: '/paciente/nueva', params: name ? { name } : {} });

  // Sin pacientes no hay nada que buscar: la pantalla entera explica qué hacer primero.
  if (!showLoading && patients !== null && patients.length === 0) {
    return <EmptyPatients onNew={() => openNew()} onQuickCalc={() => router.navigate('/')} />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.actions}>
        <SearchField value={query} onChangeText={setQuery} />
        <Button label="+ Nueva paciente" onPress={() => openNew()} />
      </View>

      {showLoading ? (
        <LoadingState label="Cargando pacientes…" />
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.ink}
              colors={[colors.ink]}
              accessibilityLabel="Actualizar pacientes"
            />
          }>
          <PatientList
            patients={visible}
            today={todayDay()}
            onOpen={(patient) =>
              router.push({ pathname: '/paciente/[id]', params: { id: String(patient.id) } })
            }
          />

          {patients !== null && trimmedQuery && visible.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sin resultados para «{trimmedQuery}»</Text>
              <Button
                label={`Agregar «${trimmedQuery}» como paciente`}
                variant="outline"
                onPress={() => openNew(trimmedQuery)}
              />
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const MIN_REFRESH_MS = 600;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  empty: {
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
});
