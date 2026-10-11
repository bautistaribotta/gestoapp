import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { colors, fonts } from '@/theme';

type ScreenHeaderProps = {
  title?: string;
  /** Texto del botón de volver (por defecto «Atrás»). */
  backLabel?: string;
  /** Oculta la flecha del botón de volver, para «Cancelar». */
  backChevron?: boolean;
  /** Acción opcional a la derecha (ej. «Editar datos»). */
  right?: ReactNode;
};

/** Barra superior de las pantallas secundarias: botón Atrás, título opcional centrado y una acción. */
export function ScreenHeader({ title, backLabel, backChevron, right }: ScreenHeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.bar}>
        <View style={styles.side}>
          <BackButton label={backLabel} chevron={backChevron} />
        </View>
        {title ? (
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 12,
    backgroundColor: colors.background,
  },
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
});
