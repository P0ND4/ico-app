import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  type TextInputProps,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

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

    const dynamicStyle = useMemo<ViewStyle>(() => {
      return {
        opacity: editable ? 1 : 0.6,
      };
    }, [editable]);

    return (
      <View style={[styles.defaultContainer, stylesContainer]}>
        {left && left()}

        <TextInput
          ref={ref}
          style={[styles.defaultInput, dynamicStyle, style]}
          secureTextEntry={secureTextEntry && !isShow}
          editable={editable}
          maxFontSizeMultiplier={1.3}
          placeholderTextColor="#9ca3af"
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity style={styles.iconContainer} activeOpacity={0.7} onPress={() => setShow(!isShow)}>
            <FontAwesome5 name={isShow ? "eye" : "eye-slash"} size={20} color="#6b7280" />
          </TouchableOpacity>
        )}

        {right && right()}
      </View>
    );
  },
);

AppInput.displayName = "AppInput";

export default React.memo(AppInput);
