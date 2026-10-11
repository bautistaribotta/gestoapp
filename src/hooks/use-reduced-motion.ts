import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true si el sistema tiene activado «reducir movimiento». */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);

  return reduced;
}
