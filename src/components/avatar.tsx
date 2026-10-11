import { StyleSheet, Text, View } from 'react-native';

import { initials } from '@/lib/text';
import { colors, fonts } from '@/theme';

type AvatarProps = {
  name: string;
  size?: 'md' | 'lg';
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <View style={[styles.circle, size === 'lg' && styles.circleLarge]}>
      <Text style={[styles.initials, size === 'lg' && styles.initialsLarge]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  initials: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink,
  },
  initialsLarge: {
    fontSize: 16,
  },
});
