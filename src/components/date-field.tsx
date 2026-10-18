import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Field, fieldStyles } from '@/components/field';
import { dayFromDate, dayFromIso, formatDay, isoFromDay, localDateFromDay } from '@/lib/dates';
import { colors, fonts } from '@/theme';
import { useToday } from '@/providers/today-provider';

type DateFieldProps = {
  label: string;
  hint?: string;
  help?: string;
  error?: string | null;
  /** Fecha en formato YYYY-MM-DD, o null si está vacía. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Muestra la opción para borrar la fecha cargada. */
  clearable?: boolean;
};

/** Campo de fecha con el selector nativo. Nunca permite fechas futuras. */
export function DateField({ label, hint, help, error, value, onChange, clearable }: DateFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const day = dayFromIso(value);
  const today = useToday();
  const pickerValue = localDateFromDay(day ?? today);
  const maximumDate = localDateFromDay(today);

  const select = (date: Date) => onChange(isoFromDay(dayFromDate(date)));

  const open = () => {
    // El selector tapa la pantalla: si quedó un campo de texto activo, se cierra el teclado.
    Keyboard.dismiss();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerValue,
        mode: 'date',
        maximumDate,
        onValueChange: (_event, date) => select(date),
      });
      return;
    }
    setIosPickerOpen((current) => !current);
  };

  return (
    <Field label={label} hint={hint} help={help} error={error}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${day === null ? 'sin cargar' : formatDay(day)}`}
          onPress={open}
          style={[
            fieldStyles.box,
            styles.box,
            error ? fieldStyles.boxError : null,
            iosPickerOpen && fieldStyles.boxFocused,
          ]}>
          <Text style={[styles.value, day === null && styles.placeholder]}>
            {day === null ? 'dd/mm/aaaa' : formatDay(day)}
          </Text>
        </Pressable>
        {clearable && day !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Borrar ${label}`}
            onPress={() => {
              setIosPickerOpen(false);
              onChange(null);
            }}
            style={styles.clear}>
            <Text style={styles.clearLabel}>Borrar</Text>
          </Pressable>
        ) : null}
      </View>
      {iosPickerOpen ? (
        <View style={styles.inlinePicker}>
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display="inline"
            locale="es-AR"
            maximumDate={maximumDate}
            accentColor={colors.ink}
            themeVariant="light"
            onValueChange={(_event, date) => {
              select(date);
              setIosPickerOpen(false);
            }}
          />
        </View>
      ) : null}
    </Field>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  box: {
    flex: 1,
  },
  value: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    color: colors.ink,
  },
  placeholder: {
    color: colors.textMuted,
  },
  clear: {
    height: 52,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  clearLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  inlinePicker: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
