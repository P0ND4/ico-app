import React, { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import type { ViewStyle } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";

export interface IconButtonProps {
  icon: React.ReactNode;
  variant?: "default" | "primary";
  size?: "small" | "default" | "large";
  onPress: () => void;
  disabled?: boolean;
}

const SIZE_MAP = {
  small: 32,
  default: 44,
  large: 56,
} as const;

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = "default",
  size = "default",
  onPress,
  disabled = false,
}) => {
  const theme = useThemeColors();
  const btnSize = SIZE_MAP[size];

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      width: btnSize,
      height: btnSize,
      borderRadius: btnSize / 2,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      opacity: disabled ? 0.4 : 1,
      ...(variant === "primary"
        ? { backgroundColor: theme.primary }
        : { borderWidth: 1, borderColor: theme.border }),
    }),
    [btnSize, disabled, variant, theme.primary, theme.border],
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
    >
      {icon}
    </TouchableOpacity>
  );
};

export default React.memo(IconButton);
