import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: "default" | "accent";
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
  },
});

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = 16,
  variant = "default",
}) => {
  const theme = useThemeColors();

  const dynamicStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      padding,
    };

    if (variant === "accent") {
      base.borderLeftWidth = 2;
      base.borderLeftColor = theme.primary;
    }

    return base;
  }, [theme.surface, theme.border, theme.primary, padding, variant]);

  const shadowStyle = useMemo<ViewStyle>(
    () => ({
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    }),
    [theme.cardShadow],
  );

  return (
    <View style={[styles.card, shadowStyle, dynamicStyle, style]}>
      {children}
    </View>
  );
};

export default React.memo(GlassCard);
