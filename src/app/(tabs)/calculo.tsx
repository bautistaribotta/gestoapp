import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/button';
import { DateField } from '@/components/date-field';
import { DiscordanceCard } from '@/components/discordance-card';
import { EcoFields, EMPTY_ECO } from '@/components/eco-fields';
import { KeyDatesCard } from '@/components/key-dates-card';
import { todayDay } from '@/lib/dates';
import { datingReference, discordance, ecoGaDaysFrom, fumError, keyDates } from '@/lib/gestation';
import { colors, fonts } from '@/theme';

export default function QuickCalcScreen() {
  const [fum, setFum] = useState<string | null>(null);
  const [eco, setEco] = useState(EMPTY_ECO);
  const today = todayDay();

  const ecoResult = eco.on ? ecoGaDaysFrom(eco.date, eco.weeks, eco.days, today) : null;
  const dating = {
    fum,
    ecoDate: ecoResult?.gaDays ? eco.date : null,
    ecoGaDays: ecoResult?.gaDays ?? null,
  };
  const reference = datingReference(dating, today);
  const comparison = discordance(dating, today);

  const saveAsPatient = () =>
    router.push({
      pathname: '/paciente/nueva',
      params: {
        ...(fum ? { fum } : {}),
        ...(dating.ecoDate ? { ecoDate: dating.ecoDate, ecoWeeks: eco.weeks, ecoDays: eco.days } : {}),
      },
    });

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
      <EcoFields
        label="¿Tiene ecografía?"
        value={eco}
        onChange={setEco}
        message={ecoResult?.message}
      />

      {reference ? (
        <>
          {comparison ? <DiscordanceCard discordance={comparison} /> : null}
          <KeyDatesCard dates={keyDates(reference)} />
          <Button
            label="¿Guardar como nueva paciente?"
            variant="link"
            size="sm"
            onPress={saveAsPatient}
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
