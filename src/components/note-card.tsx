import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { TextArea } from '@/components/field';
import { dayFromIso, formatDay, todayDay } from '@/lib/dates';
import { colors, fonts } from '@/theme';

type NoteCardProps = {
  note: string | null;
  /** Última edición de la nota (YYYY-MM-DD). */
  updatedAt: string | null;
  onSave: (note: string) => Promise<void>;
};

/** Nota única de la paciente: se ve, se edita y se reemplaza entera. */
export function NoteCard({ note, updatedAt, onSave }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const updatedDay = dayFromIso(updatedAt);
  const dateLabel =
    updatedDay === null ? null : updatedDay === todayDay() ? 'Hoy' : formatDay(updatedDay);
  const showEditor = !note || editing;
  const valid = draft.trim().length > 0;
  const canSave = valid && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
      setDraft('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Nota
        </Text>
        {note && dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
      </View>

      {showEditor ? (
        <>
          <TextArea
            accessibilityLabel="Nota"
            size="lg"
            placeholder="Antecedentes, indicaciones, recordatorios"
            value={draft}
            onChangeText={setDraft}
          />
          <View style={styles.actions}>
            {note ? (
              <View style={styles.action}>
                <Button
                  label="Cancelar"
                  variant="outline"
                  onPress={() => {
                    setEditing(false);
                    setDraft('');
                  }}
                />
              </View>
            ) : null}
            <View style={styles.action}>
              <Button
                label={note ? 'Guardar nota' : 'Agregar nota'}
                disabled={!valid}
                loading={saving}
                onPress={save}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.text}>{note}</Text>
          <Button
            label="Editar nota"
            onPress={() => {
              setDraft(note ?? '');
              setEditing(true);
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textMuted,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    flex: 1,
  },
});
