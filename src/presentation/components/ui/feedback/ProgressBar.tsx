import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "../../../hooks/useThemeColors";

export interface ProgressBarProps {
  progress: number;
  variant?: "primary" | "accent";
  size?: "small" | "default" | "large";
}

const SIZE_MAP = {
  small: 4,
  default: 8,
  large: 12,
} as const;

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = "primary",
  size = "default",
}) => {
  const theme = useThemeColors();
  const barHeight = SIZE_MAP[size];
  const animatedWidth = useSharedValue(0);

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, { duration: 500 });
  }, [clampedProgress, animatedWidth]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const trackStyle = useMemo<ViewStyle>(
    () => ({
      height: barHeight,
      backgroundColor: theme.border,
      borderRadius: barHeight / 2,
      overflow: "hidden",
    }),
    [barHeight, theme.border],
  );

  const fillColor = variant === "accent" ? theme.accent : theme.primary;

  return (
    <View style={trackStyle}>
      <Animated.View
        style={[
          {
            height: barHeight,
            backgroundColor: fillColor,
            borderRadius: barHeight / 2,
          },
          fillAnimatedStyle,
        ]}
      />
    </View>
  );
};

export default React.memo(ProgressBar);
