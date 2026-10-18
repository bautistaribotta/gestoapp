import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { Toast, type ToastPlacement } from '@/components/toast';
import { useScreenReader } from '@/hooks/use-screen-reader';

const DURATION_MS = 3000;
const DURATION_WITH_UNDO_MS = 5000;

export type ToastOptions = {
  message: string;
  /** Muestra «Deshacer» y deja el toast más tiempo en pantalla. */
  onUndo?: () => void;
  /** «tabBar» lo sube por encima de la barra de pestañas de Inicio. */
  placement?: ToastPlacement;
};

type ToastState = ToastOptions & {
  id: number;
  /** Está animando la salida; se desmonta al terminar. */
  leaving: boolean;
};

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

/** Confirmaciones breves de las operaciones (crear, editar, eliminar), visibles sobre cualquier pantalla. */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const screenReader = useScreenReader();

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setToast((current) => (current ? { ...current, leaving: true } : null));
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      clearTimeout(timer.current);
      setToast({ ...options, id: Date.now(), leaving: false });
      // Con lector de pantalla, encontrar y tocar «Deshacer» lleva más que 5 segundos: ese aviso
      // queda hasta que se cierre o se deshaga.
      if (options.onUndo && screenReader) return;
      timer.current = setTimeout(hide, options.onUndo ? DURATION_WITH_UNDO_MS : DURATION_MS);
    },
    [hide, screenReader],
  );

  // Solo quita el toast que terminó de salir; si ya se mostró otro, lo deja.
  const remove = useCallback(() => {
    setToast((current) => (current?.leaving ? null : current));
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const undo = useMemo(
    () =>
      toast?.onUndo
        ? () => {
            hide();
            toast.onUndo?.();
          }
        : undefined,
    [toast, hide],
  );

  return (
    <ToastContext value={show}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <Toast
            key={toast.id}
            message={toast.message}
            placement={toast.placement ?? 'bottom'}
            leaving={toast.leaving}
            onUndo={undo}
            onClose={hide}
            onExited={remove}
          />
        ) : null}
      </View>
    </ToastContext>
  );
}

export function useToast() {
  const show = use(ToastContext);
  if (!show) throw new Error('useToast debe usarse dentro de ToastProvider');
  return show;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
