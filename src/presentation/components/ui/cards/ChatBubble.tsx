import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Markdown from "react-native-markdown-display";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useMarkdownStyles } from "../../../hooks/useMarkdownStyles";
import AppText from "../typography/AppText";
import MermaidChatBlock from "../typography/MermaidChatBlock";
import { splitChatMarkdown } from "./chat-markdown.utils";
import { createAiMarkdownRules } from "../../../utils/markdown-display.rules";
import { preprocessMarkdownMathDisplay } from "../../../utils/math.utils";

export interface ChatBubbleProps {
  role: "user" | "model";
  text: string;
  timestamp?: string;
}

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
  modelContent: {
    width: "100%",
    alignSelf: "stretch",
  },
});

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
  const markdownStyles = useMarkdownStyles(theme, textColor);
  const modelParts = useMemo(() => (isUser ? [] : splitChatMarkdown(text)), [isUser, text]);
  const isWideContent = !isUser && WIDE_CONTENT_RE.test(text);

  const markdownRules = useMemo(
    () => createAiMarkdownRules(undefined, { indicatorColor: theme.primary }),
    [theme.primary],
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
      ) : (
        <View style={styles.modelContent}>
          {modelParts.map((part, index) =>
            part.type === "mermaid" ? (
              <MermaidChatBlock key={`mermaid-${index}`} code={part.content} textColor={textColor} />
            ) : (
              <Markdown key={`text-${index}`} style={markdownStyles} rules={markdownRules}>
                {preprocessMarkdownMathDisplay(part.content)}
              </Markdown>
            ),
          )}
        </View>
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
