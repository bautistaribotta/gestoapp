import { StyleSheet, Text, View } from 'react-native';

import type { LegalDoc } from '@/lib/legal';
import type { MarkdownBlock, TextSegment } from '@/lib/markdown';
import { colors, fonts } from '@/theme';

/** Texto completo de un documento legal: título, fecha y bloques del .md. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <View style={styles.document}>
      <Text style={styles.title} accessibilityRole="header">
        {doc.title}
      </Text>
      <Text style={styles.updated}>Última actualización: {doc.updated}</Text>
      {doc.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </View>
  );
}

function Block({ block }: { block: MarkdownBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text style={styles.heading} accessibilityRole="header">
          {block.text}
        </Text>
      );
    case 'paragraph':
      return (
        <Text style={styles.body}>
          <Segments segments={block.segments} />
        </Text>
      );
    case 'item':
      return (
        <View style={styles.item}>
          <View style={styles.bullet} />
          <Text style={[styles.body, styles.itemText]}>
            <Segments segments={block.segments} />
          </Text>
        </View>
      );
    case 'row':
      return (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{block.label}</Text>
          <Text style={styles.rowValue}>{block.value}</Text>
        </View>
      );
  }
}

function Segments({ segments }: { segments: TextSegment[] }) {
  return segments.map((segment, index) => (
    <Text key={index} style={segment.bold && styles.bold}>
      {segment.text}
    </Text>
  ));
}

const styles = StyleSheet.create({
  document: {
    gap: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
    color: colors.ink,
  },
  updated: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  heading: {
    marginTop: 12,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textBody,
  },
  bold: {
    fontFamily: fonts.bold,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    marginTop: 9,
    borderRadius: 2.5,
    backgroundColor: colors.textMuted,
  },
  itemText: {
    flex: 1,
  },
  row: {
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  rowLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  rowValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
