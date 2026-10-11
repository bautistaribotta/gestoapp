import { StyleSheet, Text, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { FieldLabel, TextField } from '@/components/field';
import { SwitchRow } from '@/components/switch-row';
import { colors, fonts } from '@/theme';

export type EcoInput = {
  on: boolean;
  /** Fecha de la ecografía (YYYY-MM-DD). */
  date: string | null;
  weeks: string;
  days: string;
};

export const EMPTY_ECO: EcoInput = { on: false, date: null, weeks: '', days: '' };

type EcoFieldsProps = {
  label: string;
  value: EcoInput;
  onChange: (value: EcoInput) => void;
  /** Mensaje de validación que se muestra debajo de los campos. */
  message?: string | null;
};

/** Tarjeta con el interruptor de ecografía, su fecha y la EG medida. */
export function EcoFields({ label, value, onChange, message }: EcoFieldsProps) {
  const update = (changes: Partial<EcoInput>) => onChange({ ...value, ...changes });

  return (
    <View style={styles.card}>
      <SwitchRow
        label={label}
        description="Si la cargás, reemplaza a la FUM"
        value={value.on}
        onValueChange={(on) => update({ on })}
      />
      {value.on ? (
        <>
          <DateField
            label="Fecha de la ecografía"
            value={value.date}
            onChange={(date) => update({ date })}
          />
          <View style={styles.ga}>
            <FieldLabel label="EG por ecografía" />
            <View style={styles.row}>
              <View style={styles.cell}>
                <TextField
                  accessibilityLabel="Semanas por ecografía"
                  unit="s"
                  mono
                  value={value.weeks}
                  onChangeText={(weeks) => update({ weeks })}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.cell}>
                <TextField
                  accessibilityLabel="Días por ecografía"
                  unit="d"
                  mono
                  value={value.days}
                  onChangeText={(days) => update({ days })}
                  keyboardType="number-pad"
                  placeholder="0"
                  maxLength={1}
                />
              </View>
            </View>
          </View>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  ga: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
