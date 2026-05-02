import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AppText from "../typography/AppText";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface AppCheckboxProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  label?: string | React.ReactNode;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({ value, onValueChange, label }) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={() => onValueChange(!value)}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: value ? colors.primary : colors.border,
            backgroundColor: value ? colors.primary : "transparent",
          },
        ]}
      >
        {value && <FontAwesome5 name="check" size={12} color="#FFFFFF" />}
      </View>

      {typeof label === "string" ? (
        <AppText variant="smallParagraph" color={colors.textPrimary} style={styles.label}>
          {label}
        </AppText>
      ) : (
        <View style={styles.label}>{label}</View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    marginLeft: 12,
    flex: 1,
  },
});

export default React.memo(AppCheckbox);
