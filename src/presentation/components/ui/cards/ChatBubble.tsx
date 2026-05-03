import React, { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../typography/AppText";

export interface ChatBubbleProps {
  role: "user" | "model";
  text: string;
  timestamp?: string;
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
  },
  timestamp: {
    marginTop: 4,
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
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            borderTopLeftRadius: 4,
          }),
    }),
    [isUser, theme.primary, theme.surface, theme.border],
  );

  const textColor = isUser ? theme.textOnPrimary : theme.textPrimary;

  return (
    <Animated.View style={[styles.bubble, containerStyle, animatedStyle]}>
      <AppText color={textColor} variant="paragraph">
        {text}
      </AppText>
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
