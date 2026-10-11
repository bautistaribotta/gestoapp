import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LegalDoc } from '@/lib/legal';
import { colors, fonts } from '@/theme';

type LegalConsentCardProps = {
  doc: LegalDoc;
  read: boolean;
  accepted: boolean;
  onOpen: () => void;
  onToggle: () => void;
};

/**
 * Tarjeta del paso 2 del onboarding: arriba se abre el documento y abajo se acepta.
 * La casilla queda bloqueada hasta que el documento se abre.
 */
export function LegalConsentCard({ doc, read, accepted, onOpen, onToggle }: LegalConsentCardProps) {
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

      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={doc.acceptLabel}
        accessibilityHint={read ? undefined : 'Abrí el documento para poder aceptarlo'}
        accessibilityState={{ checked: accepted, disabled: !read }}
        disabled={!read}
        onPress={onToggle}
        style={[styles.accept, !read && styles.acceptLocked]}>
        <View style={[styles.box, read && styles.boxReady, accepted && styles.boxChecked]}>
          {accepted ? <View style={styles.check} /> : null}
        </View>
        <View style={styles.acceptText}>
          <Text style={[styles.acceptLabel, !read && styles.acceptLabelLocked]}>
            {doc.acceptLabel}
          </Text>
          {read ? null : <Text style={styles.sub}>Abrilo para poder aceptarlo</Text>}
        </View>
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
  accept: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.sunken,
    backgroundColor: colors.surface,
  },
  acceptLocked: {
    backgroundColor: colors.background,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxReady: {
    borderColor: colors.borderStrong,
  },
  boxChecked: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  // Tilde dibujado con dos bordes rotados, como en el diseño.
  check: {
    width: 10,
    height: 5,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.surface,
    transform: [{ rotate: '-45deg' }, { translateX: 1 }, { translateY: -1 }],
  },
  acceptText: {
    flex: 1,
    gap: 2,
  },
  acceptLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  acceptLabelLocked: {
    color: colors.textMuted,
  },
});
