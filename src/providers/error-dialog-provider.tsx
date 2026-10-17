import { createContext, use, useCallback, useState, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorDialog } from '@/components/error-dialog';
import { logError } from '@/lib/log';

const DEFAULT_MESSAGE = 'Probá de nuevo. Si el problema sigue, cerrá la app y volvé a abrirla.';

export type ErrorDialogOptions = {
  /** Qué no se pudo hacer, ej. «No pudimos guardar la nota». */
  title: string;
  /** Qué pasó con los datos y qué hacer; por defecto, reintentar. */
  message?: string;
  /** Error original: se registra en desarrollo. */
  error?: unknown;
};

const ErrorDialogContext = createContext<((options: ErrorDialogOptions) => void) | null>(null);

/** Avisa con un modal las acciones que fallan (guardar, eliminar, deshacer), sobre cualquier pantalla. */
export function ErrorDialogProvider({ children }: PropsWithChildren) {
  const [dialog, setDialog] = useState<ErrorDialogOptions | null>(null);

  const show = useCallback((options: ErrorDialogOptions) => {
    if (options.error !== undefined) logError(options.title, options.error);
    setDialog(options);
  }, []);

  const close = useCallback(() => setDialog(null), []);

  return (
    <ErrorDialogContext value={show}>
      <View style={styles.root}>
        {children}
        {dialog ? (
          <ErrorDialog
            title={dialog.title}
            message={dialog.message ?? DEFAULT_MESSAGE}
            onClose={close}
          />
        ) : null}
      </View>
    </ErrorDialogContext>
  );
}

export function useErrorDialog() {
  const show = use(ErrorDialogContext);
  if (!show) throw new Error('useErrorDialog debe usarse dentro de ErrorDialogProvider');
  return show;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
