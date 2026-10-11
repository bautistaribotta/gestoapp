import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts } from '@/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchField({ value, onChangeText }: SearchFieldProps) {
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <View style={styles.iconLens} />
        <View style={styles.iconHandle} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar paciente"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Buscar paciente"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 14,
    height: 14,
  },
  iconLens: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    borderRadius: 5,
  },
  iconHandle: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 6,
    height: 2,
    backgroundColor: colors.textMuted,
    transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    padding: 0,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
});
