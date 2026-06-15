import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../config/theme.config';

export function useMarkdownStyles(theme: ThemeColors, textColor?: string) {
  const color = textColor ?? theme.textPrimary;
  const { primary, accent, accentLight, border, surfaceElevated } = theme;

  return useMemo(
    () => ({
      body: { color, fontSize: 14, lineHeight: 20 },
      paragraph: { marginTop: 0, marginBottom: 6, color },
      heading1: { color, fontSize: 18, fontWeight: '700' as const, marginBottom: 6, marginTop: 4 },
      heading2: { color, fontSize: 16, fontWeight: '700' as const, marginBottom: 4, marginTop: 4 },
      heading3: { color, fontSize: 15, fontWeight: '700' as const, marginBottom: 4, marginTop: 2 },
      heading4: { color, fontSize: 14, fontWeight: '700' as const, marginBottom: 4 },
      heading5: { color, fontSize: 14, fontWeight: '600' as const, marginBottom: 4 },
      heading6: { color, fontSize: 14, fontWeight: '600' as const, marginBottom: 4 },
      strong: { fontWeight: '700' as const, color },
      em: { fontStyle: 'italic' as const, color },
      text: { color },
      textgroup: { color },
      code_inline: {
        fontFamily: 'monospace',
        backgroundColor: `${primary}22`,
        color,
        paddingHorizontal: 4,
        borderRadius: 4,
        fontSize: 13,
        borderWidth: 0,
      },
      code_block: {
        fontFamily: 'monospace',
        backgroundColor: surfaceElevated,
        borderColor: border,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 10,
        borderRadius: 8,
        color,
        fontSize: 13,
      },
      fence: {
        fontFamily: 'monospace',
        backgroundColor: surfaceElevated,
        borderColor: border,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 10,
        borderRadius: 8,
        color,
        fontSize: 13,
      },
      blockquote: {
        backgroundColor: accentLight,
        borderLeftWidth: 3,
        borderLeftColor: accent,
        paddingLeft: 10,
        paddingRight: 8,
        paddingVertical: 6,
        marginLeft: 0,
        marginVertical: 4,
        borderRadius: 8,
      },
      bullet_list: { marginBottom: 6 },
      ordered_list: { marginBottom: 6 },
      bullet_list_icon: { color },
      ordered_list_icon: { color },
      list_item: { marginBottom: 2 },
      hr: { backgroundColor: border, height: 1, marginVertical: 8 },
      table: { borderWidth: 1, borderColor: `${primary}30`, borderRadius: 8, marginVertical: 6 },
      thead: {},
      tbody: {},
      tr: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: `${primary}20` },
      th: { backgroundColor: `${primary}14`, fontWeight: '700' as const, padding: 6, color },
      td: { padding: 6, color },
      link: { color: accent },
      image: { width: '100%', marginVertical: 8, flex: 0, alignSelf: 'stretch' as const },
    }),
    [color, primary, accent, accentLight, border, surfaceElevated],
  );
}
