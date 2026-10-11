import {
  AtkinsonHyperlegibleMono_400Regular,
  AtkinsonHyperlegibleMono_500Medium,
  AtkinsonHyperlegibleMono_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible-mono';
import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_500Medium,
  AtkinsonHyperlegibleNext_600SemiBold,
  AtkinsonHyperlegibleNext_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible-next';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { migrateDbIfNeeded } from '@/db/migrations';
import { ProfileProvider, useProfile } from '@/providers/profile-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    AtkinsonHyperlegibleNext_400Regular,
    AtkinsonHyperlegibleNext_500Medium,
    AtkinsonHyperlegibleNext_600SemiBold,
    AtkinsonHyperlegibleNext_700Bold,
    AtkinsonHyperlegibleMono_400Regular,
    AtkinsonHyperlegibleMono_500Medium,
    AtkinsonHyperlegibleMono_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="gestoapp.db" onInit={migrateDbIfNeeded}>
        <ProfileProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <RootStack />
          </ToastProvider>
        </ProfileProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { loading, profile } = useProfile();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.screen,
        animation: 'slide_from_right',
        // Deslizar para volver: en iOS desde cualquier punto de la pantalla, no solo el borde.
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}>
      <Stack.Protected guard={profile !== null}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paciente/nueva" />
        <Stack.Screen name="paciente/[id]" />
        <Stack.Screen name="paciente/editar/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={profile === null}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
});
