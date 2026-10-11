import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FieldLabel } from '@/components/field';
import { PROFILE_TITLES, type ProfileTitle } from '@/db/profile';
import { colors, fonts } from '@/theme';

type TitlePickerProps = {
  value: ProfileTitle;
  onChange: (value: ProfileTitle) => void;
};

/** Control segmentado para elegir «Dra.», «Dr.» o «Sin título». */
export function TitlePicker({ value, onChange }: TitlePickerProps) {
  return (
    <View style={styles.field}>
      <FieldLabel label="Título" />
      <View style={styles.segmented} accessibilityRole="radiogroup" accessibilityLabel="Título">
        {PROFILE_TITLES.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={[styles.segment, selected && styles.segmentSelected]}>
              <Text style={styles.segmentLabel}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: colors.sunken,
    borderRadius: 12,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.surface,
    boxShadow: [{ offsetX: 0, offsetY: 1, blurRadius: 2, color: colors.shadow }],
  },
  segmentLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
});
