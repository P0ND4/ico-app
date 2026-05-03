import React, { useMemo } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

export interface AppButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  backgroundColor?: string;
  labelColor?: string;
  widthFull?: boolean;
  loading?: boolean;
}

const styles = StyleSheet.create({
  default: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});

const AppButton: React.FC<AppButtonProps> = ({
  children,
  variant,
  backgroundColor,
  labelColor,
  widthFull,
  disabled,
  loading,
  style,
  activeOpacity = 0.7,
  ...rest
}) => {
  const theme = useThemeColors();

  const variantStyle = useMemo<ViewStyle>(() => {
    if (backgroundColor) {
      return { backgroundColor };
    }

    switch (variant) {
      case "primary":
        return { backgroundColor: theme.primary };
      case "secondary":
        return {
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.primary,
        };
      case "danger":
        return { backgroundColor: theme.danger };
      default:
        return {};
    }
  }, [variant, backgroundColor, theme.primary, theme.surface, theme.border, theme.danger]);

  const resolvedLabelColor = useMemo(() => {
    if (labelColor !== undefined) return labelColor;
    switch (variant) {
      case "primary":
        return theme.textOnPrimary;
      case "danger":
        return theme.textOnPrimary;
      case "secondary":
        return theme.textOnSurface;
      case "outline":
        return theme.primary;
      default:
        return undefined;
    }
  }, [variant, labelColor, theme.textOnPrimary, theme.textOnSurface, theme.primary]);

  const dynamicStyle = useMemo<ViewStyle>(() => {
    return {
      opacity: disabled || loading ? 0.6 : 1,
      ...(widthFull && { width: "100%" }),
      ...variantStyle,
    };
  }, [disabled, loading, widthFull, variantStyle]);

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled || loading}
      style={[styles.default, dynamicStyle, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={resolvedLabelColor ?? "#FFFFFF"} />
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default React.memo(AppButton);
