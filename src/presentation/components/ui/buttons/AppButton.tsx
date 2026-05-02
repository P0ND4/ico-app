import React, { useMemo } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";

export interface AppButtonProps extends TouchableOpacityProps {
  backgroundColor?: string;
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
  backgroundColor,
  widthFull,
  disabled,
  loading,
  style,
  activeOpacity = 0.7,
  ...rest
}) => {
  const dynamicStyle = useMemo<ViewStyle>(() => {
    return {
      opacity: disabled || loading ? 0.6 : 1,
      ...(widthFull && { width: "100%" }),
      ...(backgroundColor && { backgroundColor }),
    };
  }, [disabled, loading, widthFull, backgroundColor]);

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled || loading}
      style={[styles.default, dynamicStyle, style]}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color="#fff" /> : children}
    </TouchableOpacity>
  );
};

export default React.memo(AppButton);
