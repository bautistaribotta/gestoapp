import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertTriangle } from '@/components/alert-icons';
import { Button } from '@/components/button';
import { colors, fonts } from '@/theme';

type DeletePatientSheetProps = {
  visible: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Hoja inferior que confirma la eliminación de una paciente. */
export function DeletePatientSheet({ visible, name, onConfirm, onCancel }: DeletePatientSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <Pressable
          style={styles.dismissArea}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
        />
        <SafeAreaView edges={['bottom']} style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.warning}>
            <AlertTriangle size={12} />
            <Text style={styles.warningText}>Esta acción no se puede deshacer</Text>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            ¿Eliminar a {name}?
          </Text>
          <Text style={styles.body}>
            Se borran sus datos y su nota de esta app. Los turnos del sistema de la institución no
            cambian.
          </Text>
          <View style={styles.actions}>
            <Button label="Sí, eliminar" variant="dangerSolid" onPress={onConfirm} />
            <Button label="Cancelar" variant="outline" onPress={onCancel} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 12,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.alertText,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
});
