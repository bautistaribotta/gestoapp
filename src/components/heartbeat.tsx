import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { colors, fonts } from '@/theme';

const DURATION_MS = 1400;

type HeartbeatSize = 20 | 44 | 72;

type HeartbeatProps = {
  /** 20 en botones, 44 en tarjetas y listas, 72 en pantalla completa. */
  size?: HeartbeatSize;
  /** «inverse» para fondos oscuros, como un botón primario. */
  tone?: 'ink' | 'inverse';
};

/**
 * Indicador de carga «Latido»: un punto con una onda que se expande, como en el monitoreo fetal.
 * Con «reducir movimiento», la onda no se muestra y el punto late cambiando de opacidad.
 */
export function Heartbeat({ size = 44, tone = 'ink' }: HeartbeatProps) {
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION_MS,
        easing: reduced ? Easing.inOut(Easing.ease) : Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, reduced]);

  const sizeStyles = SIZE_STYLES[size];
  const inverse = tone === 'inverse';

  return (
    <View style={[styles.box, sizeStyles.box]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {reduced ? null : (
        <Animated.View
          style={[
            styles.wave,
            sizeStyles.wave,
            inverse && styles.waveInverse,
            {
              opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
              transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) }],
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          sizeStyles.dot,
          styles.dot,
          inverse && styles.dotInverse,
          reduced && {
            opacity: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.35, 1] }),
          },
        ]}
      />
    </View>
  );
}

type LoadingStateProps = {
  label: string;
};

/** Latido grande con un texto, centrado en la pantalla (ej. «Cargando pacientes…»). */
export function LoadingState({ label }: LoadingStateProps) {
  return (
    <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityLiveRegion="polite">
      <Heartbeat size={72} />
      <Text style={styles.stateLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: colors.ink,
  },
  waveInverse: {
    borderColor: colors.surface,
  },
  dot: {
    backgroundColor: colors.ink,
  },
  dotInverse: {
    backgroundColor: colors.surface,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 80,
  },
  stateLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

/** Medidas por tamaño, proporcionales a la versión de 44 del diseño (aro de 3 px, punto de 16). */
const SIZE_STYLES = {
  20: StyleSheet.create({
    box: { width: 20, height: 20 },
    wave: { borderRadius: 10, borderWidth: 2 },
    dot: { width: 8, height: 8, borderRadius: 4 },
  }),
  44: StyleSheet.create({
    box: { width: 44, height: 44 },
    wave: { borderRadius: 22, borderWidth: 3 },
    dot: { width: 16, height: 16, borderRadius: 8 },
  }),
  72: StyleSheet.create({
    box: { width: 72, height: 72 },
    wave: { borderRadius: 36, borderWidth: 4 },
    dot: { width: 26, height: 26, borderRadius: 13 },
  }),
} satisfies Record<HeartbeatSize, object>;
