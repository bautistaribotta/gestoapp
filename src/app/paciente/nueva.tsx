import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { DateField } from '@/components/date-field';
import { FieldLabel, TextField } from '@/components/field';
import { ScreenHeader } from '@/components/screen-header';
import { SwitchRow } from '@/components/switch-row';
import { insertPatient } from '@/db/patients';
import { dayFromIso, todayDay } from '@/lib/dates';
import { fumError } from '@/lib/gestation';
import { parseDecimal } from '@/lib/text';
import { colors, fonts } from '@/theme';

/** Valida la ecografía cargada y devuelve la EG en días, o un mensaje si falta algo. */
function ecoGaDaysFrom(date: string | null, weeks: string, days: string, today: number) {
  const ecoDay = dayFromIso(date);
  const parsedWeeks = weeks ? parseInt(weeks, 10) : NaN;
  const parsedDays = days ? parseInt(days, 10) : 0;
  if (ecoDay === null || Number.isNaN(parsedWeeks)) {
    return { gaDays: null, message: 'Completá la fecha y las semanas de la ecografía.' };
  }
  if (ecoDay > today) {
    return { gaDays: null, message: 'La ecografía no puede ser posterior a hoy.' };
  }
  if (parsedWeeks > 42 || Number.isNaN(parsedDays) || parsedDays > 6) {
    return { gaDays: null, message: 'La EG va de 0 a 42 semanas y de 0 a 6 días.' };
  }
  const gaDays = parsedWeeks * 7 + parsedDays;
  if (gaDays <= 0) {
    return { gaDays: null, message: 'La EG por ecografía tiene que ser mayor a 0.' };
  }
  return { gaDays, message: null };
}

export default function NewPatientScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ name?: string; fum?: string }>();
  const [name, setName] = useState(params.name ?? '');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [fum, setFum] = useState<string | null>(params.fum ?? null);
  const [ecoOn, setEcoOn] = useState(false);
  const [ecoDate, setEcoDate] = useState<string | null>(null);
  const [ecoWeeks, setEcoWeeks] = useState('');
  const [ecoDays, setEcoDays] = useState('');
  const [saving, setSaving] = useState(false);

  const today = todayDay();
  const parsedAge = parseInt(age, 10);
  const fumMessage = fumError(fum, today);
  const eco = ecoOn ? ecoGaDaysFrom(ecoDate, ecoWeeks, ecoDays, today) : null;
  const canSave =
    name.trim().length > 1 && parsedAge > 0 && !fumMessage && !eco?.message && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const id = await insertPatient(db, {
        name: name.trim(),
        age: parsedAge,
        weight: parseDecimal(weight),
        heightCm: parseDecimal(heightCm),
        fum,
        ecoDate: eco?.gaDays ? ecoDate : null,
        ecoGaDays: eco?.gaDays ?? null,
      });
      router.replace({ pathname: '/paciente/[id]', params: { id: String(id) } });
    } catch {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Nueva paciente" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <TextField
            label="Nombre y apellido"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <View style={styles.row}>
            <View style={styles.cell}>
              <TextField
                label="Edad"
                unit="años"
                mono
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.cell}>
              <TextField
                label="Peso"
                unit="kg"
                mono
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.cell}>
              <TextField
                label="Altura"
                unit="cm"
                mono
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          <DateField
            label="FUM"
            hint="opcional"
            help="Fecha de última menstruación. Se usa para calcular la edad gestacional si no hay ecografía cargada."
            error={fumMessage}
            value={fum}
            onChange={setFum}
            clearable
          />

          <View style={styles.ecoCard}>
            <SwitchRow
              label="Ecografía como referencia"
              description="Si se carga, reemplaza a la FUM"
              value={ecoOn}
              onValueChange={setEcoOn}
            />
            {ecoOn ? (
              <>
                <DateField label="Fecha de la ecografía" value={ecoDate} onChange={setEcoDate} />
                <View style={styles.ecoGa}>
                  <FieldLabel label="EG por ecografía" />
                  <View style={styles.row}>
                    <View style={styles.cell}>
                      <TextField
                        accessibilityLabel="Semanas por ecografía"
                        unit="s"
                        mono
                        value={ecoWeeks}
                        onChangeText={setEcoWeeks}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>
                    <View style={styles.cell}>
                      <TextField
                        accessibilityLabel="Días por ecografía"
                        unit="d"
                        mono
                        value={ecoDays}
                        onChangeText={setEcoDays}
                        keyboardType="number-pad"
                        placeholder="0"
                        maxLength={1}
                      />
                    </View>
                  </View>
                </View>
                {eco?.message ? <Text style={styles.ecoMessage}>{eco.message}</Text> : null}
              </>
            ) : null}
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Button label="Guardar paciente" size="lg" disabled={!canSave} onPress={save} />
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  ecoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  ecoGa: {
    gap: 6,
  },
  ecoMessage: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
