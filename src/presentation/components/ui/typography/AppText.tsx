import React, { useMemo } from "react";
import { Text, type TextProps, StyleSheet, type TextStyle } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";

export type TextVariant =
  | "bigTitle"
  | "title"
  | "smallTitle"
  | "bigSubtitle"
  | "subtitle"
  | "smallSubtitle"
  | "bigParagraph"
  | "paragraph"
  | "smallParagraph"
  | "verySmall";

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  weight?: TextStyle["fontWeight"];
  lineThrough?: boolean;
  muted?: boolean;
}

const VARIANTS = StyleSheet.create({
  bigTitle: { fontSize: 36, lineHeight: 42, fontWeight: "bold" },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "bold" },
  smallTitle: { fontSize: 24, lineHeight: 30, fontWeight: "600" },
  bigSubtitle: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
  subtitle: { fontSize: 18, lineHeight: 26, fontWeight: "500" },
  smallSubtitle: { fontSize: 16, lineHeight: 24, fontWeight: "500" },
  bigParagraph: { fontSize: 16, lineHeight: 24 },
  paragraph: { fontSize: 14, lineHeight: 20 },
  smallParagraph: { fontSize: 12, lineHeight: 18 },
  verySmall: { fontSize: 10, lineHeight: 14 },
});

const AppText: React.FC<AppTextProps> = ({
  variant = "paragraph",
  color,
  align = "auto",
  weight,
  style,
  children,
  lineThrough,
  muted = false,
  ...rest
}) => {
  const theme = useThemeColors();

  const dynamicStyle = useMemo<TextStyle>(() => {
    const resolvedColor = color ?? (muted ? theme.textMuted : theme.textPrimary);

    return {
      color: resolvedColor,
      textAlign: align,
      ...(weight && { fontWeight: weight }),
      ...(lineThrough && { textDecorationLine: "line-through" }),
    };
  }, [color, align, weight, lineThrough, muted, theme.textPrimary, theme.textMuted]);

  return (
    <Text maxFontSizeMultiplier={1.3} style={[styles.base, VARIANTS[variant], dynamicStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: "Roboto",
    flexShrink: 1,
  },
});

export default React.memo(AppText);
