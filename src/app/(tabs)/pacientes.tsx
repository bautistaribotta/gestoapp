import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { EmptyPatients } from '@/components/empty-patients';
import { LoadingState } from '@/components/heartbeat';
import { LoadError } from '@/components/load-error';
import { PatientList } from '@/components/patient-list';
import { SearchField } from '@/components/search-field';
import { listPatients, onPatientsChanged, type Patient } from '@/db/patients';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { todayDay } from '@/lib/dates';
import { logError } from '@/lib/log';
import { normalizeForSearch } from '@/lib/text';
import { useErrorDialog } from '@/providers/error-dialog-provider';
import { colors, fonts } from '@/theme';

export default function PatientsScreen() {
  const db = useSQLiteContext();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const showLoading = useDelayedFlag(patients === null && !loadFailed);
  const showError = useErrorDialog();

  /** Devuelve si se cargó. Si falla con el listado ya en pantalla, se deja el que estaba. */
  const load = useCallback(async () => {
    try {
      setPatients(await listPatients(db));
      setLoadFailed(false);
      return true;
    } catch (error) {
      logError('Cargar pacientes', error);
      setLoadFailed(true);
      return false;
    }
  }, [db]);

  const retryLoad = () => {
    setLoadFailed(false);
    load();
  };

  // La base es local y responde al instante: se deja el indicador un momento para que el gesto tenga respuesta.
  const refresh = async () => {
    setRefreshing(true);
    const [loaded] = await Promise.all([
      load(),
      new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_MS)),
    ]);
    setRefreshing(false);
    if (!loaded) showError({ title: 'No pudimos actualizar las pacientes' });
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
    return (
      <EmptyPatients
        onNew={() => openNew()}
        onImport={() => router.push('/copia/importar')}
        onQuickCalc={() => router.navigate('/')}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.actions}>
        <SearchField value={query} onChangeText={setQuery} />
        <Button label="+ Nueva paciente" onPress={() => openNew()} />
      </View>

      {patients === null && loadFailed ? (
        <LoadError title="No pudimos cargar las pacientes" onRetry={retryLoad} />
      ) : showLoading ? (
        <LoadingState label="Cargando pacientes…" />
      ) : (
        <PatientList
          patients={visible}
          today={todayDay()}
          onOpen={(patient) =>
            router.push({ pathname: '/paciente/[id]', params: { id: String(patient.id) } })
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.ink}
              colors={[colors.ink]}
              accessibilityLabel="Actualizar pacientes"
            />
          }
          emptyComponent={
            patients !== null && trimmedQuery ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Sin resultados para «{trimmedQuery}»</Text>
                <Button
                  label={`Agregar «${trimmedQuery}» como paciente`}
                  variant="outline"
                  onPress={() => openNew(trimmedQuery)}
                />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const MIN_REFRESH_MS = 600;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
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
