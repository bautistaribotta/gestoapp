import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { greeting } from '@/db/profile';
import { formatLongDay, todayDay } from '@/lib/dates';
import { useProfile } from '@/providers/profile-provider';
import { colors, fonts } from '@/theme';

/** Inicio con barra de 2 pestañas (variante 2b del diseño, con acciones en oscuro sólido). */
export default function HomeTabsLayout() {
  const { profile } = useProfile();

  return (
    <Tabs style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.date}>{formatLongDay(todayDay())}</Text>
        <Text style={styles.greeting} accessibilityRole="header">
          {greeting(profile)}
        </Text>
      </SafeAreaView>
      <View style={styles.slot}>
        <TabSlot />
      </View>
      <TabList asChild>
        <SafeAreaView edges={['bottom']} style={styles.tabBar}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton label="Pacientes" />
          </TabTrigger>
          <TabTrigger name="calculo" href="/calculo" asChild>
            <TabButton label="Cálculo rápido" />
          </TabTrigger>
        </SafeAreaView>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
};

function TabButton({ label, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={styles.tab}>
      <View style={[styles.tabIndicator, isFocused && styles.tabIndicatorActive]} />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 2,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
    color: colors.ink,
  },
  slot: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabIndicator: {
    width: 28,
    height: 4,
    borderRadius: 2,
  },
  tabIndicatorActive: {
    backgroundColor: colors.ink,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabLabelActive: {
    fontFamily: fonts.bold,
    color: colors.ink,
  },
});
