import { StyleSheet, Text, View } from 'react-native';

import { AlertTriangle } from '@/components/alert-icons';
import { Button } from '@/components/button';
import { colors, fonts } from '@/theme';

type LoadErrorProps = {
  /** Qué no se pudo cargar, ej. «No pudimos cargar las pacientes». */
  title: string;
  message?: string;
  /** Si se omite, no se muestra «Reintentar» (ej. una paciente que no existe). */
  onRetry?: () => void;
};

/** Reemplaza al contenido cuando una carga falla, centrado como el indicador de carga. */
export function LoadError({ title, message, onRetry }: LoadErrorProps) {
  return (
    <View style={styles.state}>
      <View style={styles.text} accessible accessibilityRole="alert">
        <View style={styles.titleRow}>
          {onRetry ? <AlertTriangle size={12} /> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
      {onRetry ? <Button label="Reintentar" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  text: {
    alignItems: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
