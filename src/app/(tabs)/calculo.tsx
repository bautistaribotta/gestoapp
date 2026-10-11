import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/button';
import { DateField } from '@/components/date-field';
import { GestationCard } from '@/components/gestation-card';
import { todayDay } from '@/lib/dates';
import { fumError, gestationFromFum } from '@/lib/gestation';
import { colors, fonts } from '@/theme';

export default function QuickCalcScreen() {
  const [fum, setFum] = useState<string | null>(null);
  const today = todayDay();
  const gestation = gestationFromFum(fum, today);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">
        Cálculo rápido
      </Text>
      <DateField
        label="FUM"
        hint="fecha de última menstruación"
        error={fumError(fum, today)}
        value={fum}
        onChange={setFum}
      />

      {gestation && fum ? (
        <>
          <GestationCard gestation={gestation} detailed />
          <Button
            label="Guardar como paciente nueva"
            variant="outline"
            onPress={() => router.push({ pathname: '/paciente/nueva', params: { fum } })}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
  },
});
