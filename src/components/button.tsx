import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, fonts } from '@/theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'outline' | 'accent';
  size?: 'md' | 'lg';
};

export function Button({ label, variant = 'primary', size = 'md', disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.large : styles.medium,
        styles[variant],
        pressed && pressedStyles[variant],
        disabled && styles.disabled,
      ]}
      {...props}>
      <Text
        style={[
          styles.label,
          size === 'lg' && styles.labelLarge,
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
  medium: {
    minHeight: 52,
  },
  large: {
    minHeight: 56,
  },
  primary: {
    backgroundColor: colors.ink,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  accent: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  disabled: {
    backgroundColor: colors.border,
    borderWidth: 0,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  labelLarge: {
    fontSize: 17,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.inkPressed,
  },
  outline: {
    backgroundColor: colors.sunken,
  },
  accent: {
    borderColor: colors.accentText,
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
  accent: {
    color: colors.accentText,
  },
});
