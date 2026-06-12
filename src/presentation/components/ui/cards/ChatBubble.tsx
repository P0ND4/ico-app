import React, { useEffect, useMemo } from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Markdown from "react-native-markdown-display";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../typography/AppText";
import AiMarkdownView from "../typography/AiMarkdownView";

export interface ChatBubbleProps {
  role: "user" | "model";
  text: string;
  timestamp?: string;
}

const MERMAID_RE = /```mermaid/i;
const WIDE_CONTENT_RE = /```|^\|.+\|/m;

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  bubbleUser: {
    maxWidth: "85%",
  },
  bubbleModel: {
    maxWidth: "95%",
  },
  bubbleModelWide: {
    maxWidth: "100%",
  },
  timestamp: {
    marginTop: 4,
  },
  fenceScroll: {
    maxWidth: "100%",
    marginVertical: 4,
  },
});

function useMarkdownStyles(textColor: string, primary: string) {
  return useMemo(
    () => ({
      body: { color: textColor, fontSize: 14, lineHeight: 20 },
      paragraph: { marginTop: 0, marginBottom: 6, color: textColor },
      heading1: { color: textColor, fontSize: 18, fontWeight: "700" as const, marginBottom: 6 },
      heading2: { color: textColor, fontSize: 16, fontWeight: "700" as const, marginBottom: 4 },
      heading3: { color: textColor, fontSize: 14, fontWeight: "700" as const, marginBottom: 4 },
      strong: { fontWeight: "700" as const, color: textColor },
      em: { fontStyle: "italic" as const, color: textColor },
      code_inline: {
        fontFamily: "monospace",
        backgroundColor: `${primary}22`,
        color: textColor,
        paddingHorizontal: 4,
        borderRadius: 4,
        fontSize: 13,
      },
      fence: {
        fontFamily: "monospace",
        backgroundColor: `${primary}18`,
        padding: 10,
        borderRadius: 8,
        color: textColor,
        fontSize: 13,
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: primary,
        paddingLeft: 10,
        marginLeft: 0,
        opacity: 0.8,
      },
      bullet_list_icon: { color: textColor },
      ordered_list_icon: { color: textColor },
      table: { borderWidth: 1, borderColor: `${primary}30`, borderRadius: 8, marginVertical: 4 },
      th: { backgroundColor: `${primary}14`, fontWeight: "700" as const, padding: 6, color: textColor },
      td: { padding: 6, color: textColor },
    }),
    [textColor, primary],
  );
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, timestamp }) => {
  const theme = useThemeColors();
  const isUser = role === "user";

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(isUser ? 20 : -20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    translateX.value = withTiming(0, { duration: 200 });
  }, [opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      alignSelf: isUser ? "flex-end" : "flex-start",
      ...(isUser
        ? {
            backgroundColor: theme.primary,
            borderTopRightRadius: 4,
          }
        : {
            backgroundColor: theme.primaryLight,
            borderWidth: 1,
            borderColor: `${theme.primary}20`,
            borderTopLeftRadius: 4,
          }),
    }),
    [isUser, theme.primary, theme.primaryLight],
  );

  const textColor = isUser ? theme.textOnPrimary : theme.textPrimary;
  const markdownStyles = useMarkdownStyles(textColor, theme.primary);
  const needsWebView = !isUser && MERMAID_RE.test(text);
  const isWideContent = !isUser && WIDE_CONTENT_RE.test(text);

  const markdownRules = useMemo(
    () => ({
      fence: (node: { key: string; content: string }, _c: unknown, _p: unknown, mdStyles: { fence: object }) => (
        <ScrollView
          key={node.key}
          horizontal
          nestedScrollEnabled
          style={styles.fenceScroll}
          showsHorizontalScrollIndicator
        >
          <Text style={mdStyles.fence}>{node.content}</Text>
        </ScrollView>
      ),
    }),
    [],
  );

  const bubbleWidthStyle = isUser
    ? styles.bubbleUser
    : isWideContent
      ? styles.bubbleModelWide
      : styles.bubbleModel;

  return (
    <Animated.View style={[styles.bubble, bubbleWidthStyle, containerStyle, animatedStyle]}>
      {isUser ? (
        <AppText color={textColor} variant="paragraph">{text}</AppText>
      ) : needsWebView ? (
        <AiMarkdownView content={text} textColor={textColor} compact fontSize={14} />
      ) : (
        <Markdown style={markdownStyles} rules={markdownRules}>{text}</Markdown>
      )}
      {timestamp ? (
        <AppText
          color={theme.textMuted}
          variant="verySmall"
          style={styles.timestamp}
        >
          {timestamp}
        </AppText>
      ) : null}
    </Animated.View>
  );
};

export default React.memo(ChatBubble);
