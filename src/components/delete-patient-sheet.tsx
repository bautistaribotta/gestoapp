import { ConfirmSheet } from '@/components/confirm-sheet';

type DeletePatientSheetProps = {
  visible: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Hoja inferior que confirma la eliminación de una paciente. */
export function DeletePatientSheet({ visible, name, onConfirm, onCancel }: DeletePatientSheetProps) {
  return (
    <ConfirmSheet
      visible={visible}
      warning="Esta acción no se puede deshacer"
      title={`¿Eliminar a ${name}?`}
      body="Se borran sus datos y su nota de esta app."
      confirmLabel="Sí, eliminar"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
