import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useThemeColors } from "../../../hooks/useThemeColors";

const DOT_SIZE = 8;
const DOT_GAP = 4;
const BOUNCE_DISTANCE = -8;
const BOUNCE_DURATION = 300;

interface TypingDotProps {
  color: string;
  delay: number;
}

const TypingDot: React.FC<TypingDotProps> = ({ color, delay }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(BOUNCE_DISTANCE, {
            duration: BOUNCE_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: BOUNCE_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );

    return () => {
      translateY.value = 0;
    };
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const TypingIndicator: React.FC = () => {
  const theme = useThemeColors();

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      borderTopLeftRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      gap: DOT_GAP,
      alignSelf: "flex-start",
    }),
    [theme.surface, theme.border],
  );

  return (
    <View style={containerStyle}>
      <TypingDot color={theme.textMuted} delay={0} />
      <TypingDot color={theme.textMuted} delay={200} />
      <TypingDot color={theme.textMuted} delay={400} />
    </View>
  );
};

export default React.memo(TypingIndicator);
