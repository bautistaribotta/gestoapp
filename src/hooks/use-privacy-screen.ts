import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { logError } from '@/lib/log';

/**
 * Oculta los datos de las pacientes en el selector de apps. En iOS aplica un desenfoque. En Android
 * la única forma es FLAG_SECURE, que además bloquea las capturas de pantalla: solo se activa fuera
 * de desarrollo, para poder sacar capturas mientras se trabaja en la app.
 */
export function usePrivacyScreen() {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      ScreenCapture.enableAppSwitcherProtectionAsync(0.9).catch((error: unknown) =>
        logError('Protección del selector de apps', error),
      );
    } else if (Platform.OS === 'android' && !__DEV__) {
      ScreenCapture.preventScreenCaptureAsync('selector-de-apps').catch((error: unknown) =>
        logError('Protección del selector de apps', error),
      );
    }
  }, []);
}
