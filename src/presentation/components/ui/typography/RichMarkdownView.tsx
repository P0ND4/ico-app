import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useMarkdownStyles } from '../../../hooks/useMarkdownStyles';
import { createAiMarkdownRules } from '../../../utils/markdown-display.rules';
import { preprocessMarkdownMathDisplay } from '../../../utils/math.utils';
import {
  hasMathDelimiters,
  normalizeMarkdownContent,
} from '../../../utils/markdown-html.utils';
import { splitChatMarkdown } from '../cards/chat-markdown.utils';
import MermaidChatBlock from './MermaidChatBlock';
import KaTeXMarkdownBlock from './KaTeXMarkdownBlock';

export interface RichMarkdownViewProps {
  content: string;
  fontSize?: number;
  textColor?: string;
  /** KaTeX WebView solo para bloques con $...$ fuera de código. Desactivado por defecto. */
  enableMath?: boolean;
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
});

const RichMarkdownView: React.FC<RichMarkdownViewProps> = ({
  content,
  fontSize = 14,
  textColor: textColorProp,
  enableMath = false,
}) => {
  const theme = useThemeColors();
  const textColor = textColorProp ?? theme.textPrimary;
  const codeBg = `${theme.primary}18`;

  const normalized = useMemo(
    () => preprocessMarkdownMathDisplay(normalizeMarkdownContent(content)),
    [content],
  );
  const parts = useMemo(() => splitChatMarkdown(normalized), [normalized]);
  const markdownStyles = useMarkdownStyles(theme, textColor);
  const rules = useMemo(
    () => createAiMarkdownRules(undefined, { indicatorColor: theme.primary }),
    [theme.primary],
  );

  if (!normalized.trim()) return null;

  return (
    <View style={styles.root}>
      {parts.map((part, index) => {
        if (part.type === 'mermaid') {
          return (
            <MermaidChatBlock
              key={`mermaid-${index}`}
              code={part.content}
              textColor={textColor}
            />
          );
        }

        if (enableMath && hasMathDelimiters(part.content)) {
          return (
            <KaTeXMarkdownBlock
              key={`math-${index}`}
              content={part.content}
              textColor={textColor}
              primaryColor={theme.primary}
              borderColor={theme.border}
              codeBg={codeBg}
              fontSize={fontSize}
            />
          );
        }

        return (
          <Markdown key={`md-${index}`} style={markdownStyles} rules={rules}>
            {part.content}
          </Markdown>
        );
      })}
    </View>
  );
};

export default React.memo(RichMarkdownView);
