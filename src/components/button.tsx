import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Heartbeat } from '@/components/heartbeat';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';

import { colors, fonts } from '@/theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'outline' | 'link' | 'danger' | 'dangerSolid';
  size?: 'sm' | 'md' | 'lg';
  /** Operación en curso: el botón no responde y, si tarda, muestra Latido y `loadingLabel`. */
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled,
  loading = false,
  loadingLabel = 'Guardando…',
  ...props
}: ButtonProps) {
  const showLoading = useDelayedFlag(loading);
  // Mientras se muestra la carga, el botón conserva su color en lugar del gris de deshabilitado.
  const looksDisabled = disabled && !showLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        styles[variant],
        pressed && pressedStyles[variant],
        looksDisabled && styles.disabled,
      ]}
      {...props}>
      {showLoading ? (
        <Heartbeat size={20} tone={INVERSE_VARIANTS.has(variant) ? 'inverse' : 'ink'} />
      ) : null}
      <Text
        style={[
          styles.label,
          labelSizeStyles[size],
          labelStyles[variant],
          looksDisabled && styles.labelDisabled,
        ]}>
        {showLoading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}

/** Variantes con fondo oscuro, donde Latido va en blanco. */
const INVERSE_VARIANTS = new Set<ButtonProps['variant']>(['primary', 'dangerSolid']);

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.ink,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  link: {
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  danger: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.alertBorder,
  },
  dangerSolid: {
    backgroundColor: colors.alertStrong,
  },
  disabled: {
    backgroundColor: colors.border,
    borderWidth: 0,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  md: {
    minHeight: 52,
  },
  lg: {
    minHeight: 56,
  },
});

const labelSizeStyles = StyleSheet.create({
  sm: {
    fontSize: 15,
  },
  md: {},
  lg: {
    fontSize: 17,
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.inkPressed,
  },
  outline: {
    backgroundColor: colors.sunken,
  },
  link: {
    opacity: 0.6,
  },
  danger: {
    backgroundColor: colors.alertSoft,
  },
  dangerSolid: {
    backgroundColor: colors.alertText,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: colors.surface,
  },
  outline: {
    color: colors.ink,
    fontFamily: fonts.semibold,
  },
  link: {
    color: colors.ink,
    textDecorationLine: 'underline',
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  danger: {
    color: colors.alertText,
    fontSize: 15,
  },
  dangerSolid: {
    color: colors.surface,
  },
});
