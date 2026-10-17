import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type LogoProps = {
  /** Lado en px. 56 en el onboarding. */
  size?: number;
};

/**
 * Logo «Cuna» (f1 del design system). Se dibuja sobre una caja de 100 unidades escalada a
 * `size`: la cuna es medio disco de radio 32 bajo y=52 y el bebé un círculo de radio 11 en (36, 40).
 */
export function Logo({ size = 56 }: LogoProps) {
  const unit = size / 100;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel="GestoApp">
      <View
        style={[
          styles.cradle,
          {
            left: 18 * unit,
            top: 52 * unit,
            width: 64 * unit,
            height: 32 * unit,
            borderBottomLeftRadius: 32 * unit,
            borderBottomRightRadius: 32 * unit,
          },
        ]}
      />
      <View
        style={[
          styles.baby,
          { left: 25 * unit, top: 29 * unit, width: 22 * unit, height: 22 * unit, borderRadius: 11 * unit },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cradle: {
    position: 'absolute',
    backgroundColor: colors.ink,
  },
  baby: {
    position: 'absolute',
    backgroundColor: colors.logoAccent,
  },
});
