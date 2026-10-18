import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true si hay un lector de pantalla activo (VoiceOver o TalkBack). */
export function useScreenReader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setEnabled);
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => subscription.remove();
  }, []);

  return enabled;
}
