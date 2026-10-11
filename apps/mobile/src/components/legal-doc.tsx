import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { LegalBlock } from '@/legal/types';
import { textStyles } from './ui';

/** Renders **bold** and `code` spans. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**')) return <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>;
        if (part.startsWith('`')) return <Text key={i} style={styles.code}>{part.slice(1, -1)}</Text>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

export function LegalDocument({ blocks }: { blocks: LegalBlock[] }) {
  const theme = useTheme();
  const body = [textStyles.body, { color: theme.text }];

  return (
    <View style={styles.doc}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return (
              <Text key={idx} accessibilityRole="header" style={[textStyles.heading, { color: theme.text, marginTop: Spacing.md }]}>
                {block.text}
              </Text>
            );
          case 'paragraph':
            return (
              <Text key={idx} style={body}>
                <Inline text={block.text} />
              </Text>
            );
          case 'list':
            return (
              <View key={idx} style={styles.list}>
                {block.items.map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={body} importantForAccessibility="no" accessibilityElementsHidden>•</Text>
                    <Text style={[body, styles.flex]}>
                      <Inline text={item} />
                    </Text>
                  </View>
                ))}
              </View>
            );
          case 'table':
            // Tables are shown as one card per row, which reads better on a
            // phone and with a screen reader than a wide grid.
            return (
              <View key={idx} style={styles.list}>
                {block.rows.map((row, r) => (
                  <View key={r} style={[styles.tableRow, { borderColor: theme.border }]} accessible>
                    {row.map((cell, c) => (
                      <Text key={c} style={[textStyles.caption, { color: theme.text }]}>
                        <Text style={styles.bold}>{block.header[c]}: </Text>
                        <Inline text={cell} />
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  doc: { gap: Spacing.sm },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  code: { fontFamily: 'monospace' },
  list: { gap: Spacing.xs },
  listItem: { flexDirection: 'row', gap: Spacing.sm, paddingLeft: Spacing.xs },
  tableRow: { borderWidth: 1, borderRadius: 8, padding: Spacing.sm, gap: 2 },
});
