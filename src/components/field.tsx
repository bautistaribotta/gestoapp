import { useState, type PropsWithChildren } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { AlertTriangle } from '@/components/alert-icons';
import { colors, fonts } from '@/theme';

type FieldLabelProps = {
  label: string;
  hint?: string;
};

export function FieldLabel({ label, hint }: FieldLabelProps) {
  return (
    <Text style={styles.label}>
      {label}
      {hint ? <Text style={styles.labelHint}> · {hint}</Text> : null}
    </Text>
  );
}

type FieldProps = PropsWithChildren<
  Partial<FieldLabelProps> & {
    help?: string;
    /** Mensaje de error; se muestra en lugar de la ayuda. */
    error?: string | null;
  }
>;

export function Field({ label, hint, help, error, children }: FieldProps) {
  return (
    <View style={styles.field}>
      {label ? <FieldLabel label={label} hint={hint} /> : null}
      {children}
      {error ? <FieldError message={error} /> : help ? <Text style={styles.help}>{help}</Text> : null}
    </View>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <AlertTriangle />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  /** Si se omite, pasar accessibilityLabel. */
  label?: string;
  hint?: string;
  /** Mensaje de error debajo del campo. */
  error?: string | null;
  /** Unidad que se muestra a la derecha del valor (ej. "kg"). */
  unit?: string;
  mono?: boolean;
};

export function TextField({ label, hint, error, unit, mono, onFocus, onBlur, ...props }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Field label={label} hint={hint} error={error}>
      <View
        style={[
          styles.box,
          unit ? styles.boxWithUnit : null,
          error ? fieldStyles.boxError : null,
          focused && styles.boxFocused,
          focused && unit ? styles.boxWithUnitFocused : null,
        ]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          autoComplete="off"
          accessibilityLabel={label}
          style={[styles.input, mono && styles.inputMono]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </Field>
  );
}

type TextAreaProps = Omit<TextInputProps, 'style' | 'multiline'> & {
  label?: string;
  hint?: string;
  /** md: 3 líneas, lg: 4 líneas. */
  size?: 'md' | 'lg';
};

/** Campo de texto de varias líneas (ej. la nota de la paciente). */
export function TextArea({ label, hint, size = 'md', onFocus, onBlur, ...props }: TextAreaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Field label={label} hint={hint}>
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        style={[styles.area, size === 'lg' && styles.areaLarge, focused && styles.areaFocused]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...props}
      />
    </Field>
  );
}

export const fieldStyles = StyleSheet.create({
  box: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boxFocused: {
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 13,
  },
  boxError: {
    borderColor: colors.alertStrong,
  },
});

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  labelHint: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  help: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.alertText,
  },
  box: fieldStyles.box,
  boxWithUnit: {
    paddingHorizontal: 10,
  },
  boxFocused: fieldStyles.boxFocused,
  boxWithUnitFocused: {
    paddingHorizontal: 9,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    padding: 0,
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.ink,
  },
  inputMono: {
    fontFamily: fonts.monoMedium,
  },
  area: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    minHeight: 90,
  },
  areaLarge: {
    minHeight: 112,
  },
  areaFocused: {
    borderWidth: 2,
    borderColor: colors.ink,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  unit: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
