import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type TextInputProps,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useThemeColors } from "../../../hooks/useThemeColors";

export interface AppInputProps extends TextInputProps {
  stylesContainer?: StyleProp<ViewStyle>;
  left?: () => React.ReactNode;
  right?: () => React.ReactNode;
}

const styles = StyleSheet.create({
  defaultContainer: {
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    flexShrink: 0,
    gap: 10,
    paddingHorizontal: 12,
  },
  defaultInput: {
    paddingVertical: 8,
    fontSize: 14,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 48,
  },
  iconContainer: {
    padding: 4,
  },
});

const AppInput = React.forwardRef<TextInput, AppInputProps>(
  ({ editable = true, style, stylesContainer, secureTextEntry, left, right, ...rest }, ref) => {
    const [isShow, setShow] = useState(false);
    const theme = useThemeColors();

    const dynamicStyle = useMemo<ViewStyle>(() => {
      return {
        opacity: editable ? 1 : 0.6,
      };
    }, [editable]);

    const containerStyle = useMemo<ViewStyle>(() => {
      return {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
      };
    }, [theme.surface, theme.border]);

    const inputStyle = useMemo<TextStyle>(() => {
      return {
        color: theme.textPrimary,
      };
    }, [theme.textPrimary]);

    return (
      <View style={[styles.defaultContainer, containerStyle, stylesContainer]}>
        {left && left()}

        <TextInput
          ref={ref}
          style={[styles.defaultInput, inputStyle, dynamicStyle, style]}
          secureTextEntry={secureTextEntry && !isShow}
          editable={editable}
          maxFontSizeMultiplier={1.3}
          placeholderTextColor={theme.textMuted}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity style={styles.iconContainer} activeOpacity={0.7} onPress={() => setShow(!isShow)}>
            <FontAwesome5 name={isShow ? "eye" : "eye-slash"} size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        {right && right()}
      </View>
    );
  },
);

AppInput.displayName = "AppInput";

export default React.memo(AppInput);
