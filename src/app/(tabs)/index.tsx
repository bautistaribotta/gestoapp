import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { PatientList } from '@/components/patient-list';
import { SearchField } from '@/components/search-field';
import { listPatients, type Patient } from '@/db/patients';
import { todayDay } from '@/lib/dates';
import { normalizeForSearch } from '@/lib/text';
import { colors, fonts } from '@/theme';

export default function PatientsScreen() {
  const db = useSQLiteContext();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      listPatients(db).then(setPatients);
    }, [db]),
  );

  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeForSearch(trimmedQuery);
  const visible = (patients ?? []).filter(
    (patient) => !normalizedQuery || normalizeForSearch(patient.name).includes(normalizedQuery),
  );

  const openNew = (name?: string) =>
    router.push({ pathname: '/paciente/nueva', params: name ? { name } : {} });

  return (
    <View style={styles.screen}>
      <View style={styles.actions}>
        <SearchField value={query} onChangeText={setQuery} />
        <Button label="+ Nueva paciente" onPress={() => openNew()} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
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

        {patients !== null && patients.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Todavía no cargaste pacientes</Text>
            <Text style={styles.emptyText}>Usá «+ Nueva paciente» para agregar la primera.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

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
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
