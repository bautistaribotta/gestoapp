import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LegalDoc } from '@/lib/legal';
import { colors, fonts } from '@/theme';

type LegalConsentCardProps = {
  doc: LegalDoc;
  read: boolean;
  onOpen: () => void;
};

/**
 * Tarjeta del paso 2 del onboarding: abre el documento y muestra si ya se leyó.
 * La aceptación no está acá: es el botón «Aceptar y continuar», para los dos documentos juntos.
 */
export function LegalConsentCard({ doc, read, onOpen }: LegalConsentCardProps) {
  const status = read ? 'Leído' : 'Sin abrir';

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${doc.name}. ${status}`}
        accessibilityHint="Abre el documento"
        onPress={onOpen}
        style={({ pressed }) => [styles.open, pressed && styles.pressed]}>
        <View style={styles.openText}>
          <Text style={styles.name}>{doc.name}</Text>
          <Text style={styles.sub}>
            {status} · ≈ {doc.readingMinutes} min de lectura
          </Text>
        </View>
        {read ? (
          <View style={styles.readBadge}>
            <Text style={styles.readBadgeLabel}>Leído</Text>
          </View>
        ) : (
          <View style={styles.readAction}>
            <Text style={styles.readActionLabel}>Leer</Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  open: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.sunken,
  },
  openText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  readBadge: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: colors.sunken,
  },
  readBadgeLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  readAction: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  readActionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  chevron: {
    fontFamily: fonts.regular,
    fontSize: 20,
    color: colors.textMuted,
  },
});
