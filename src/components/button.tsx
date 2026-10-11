import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, fonts } from '@/theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'outline' | 'link' | 'danger' | 'dangerSolid';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ label, variant = 'primary', size = 'md', disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        styles[variant],
        pressed && pressedStyles[variant],
        disabled && styles.disabled,
      ]}
      {...props}>
      <Text
        style={[
          styles.label,
          labelSizeStyles[size],
          labelStyles[variant],
          disabled && styles.labelDisabled,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
