import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import AppText from "../typography/AppText";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface Option {
  label: string;
  value: string;
}

interface AppSegmentedPickerProps {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

const AppSegmentedPicker: React.FC<AppSegmentedPickerProps> = ({ options, selectedValue, onSelect, style }) => {
  const colors = useThemeColors();

  // Encontrar índice activo para animar el switch
  const activeIndex = options.findIndex((o) => o.value === selectedValue);
  const slidePosition = useSharedValue(0);

  useEffect(() => {
    slidePosition.value = withSpring(activeIndex * 100, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
  }, [activeIndex]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      left: `${slidePosition.value / options.length}%`,
      width: `${100 / options.length}%`,
    };
  });

  const containerBg = `${colors.surface}73`;
  const indicatorBg = colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: containerBg }, style]}>
      {/* Indicador Animado */}
      <Animated.View style={[styles.indicator, { backgroundColor: indicatorBg }, animatedIndicatorStyle]} />

      {options.map((option, index) => {
        const isActive = option.value === selectedValue;
        return (
          <TouchableOpacity
            key={option.value}
            style={styles.optionBtn}
            activeOpacity={0.8}
            onPress={() => onSelect(option.value)}
          >
            <AppText
              variant="smallParagraph"
              weight={isActive ? "700" : "600"}
              color={isActive ? "#FFFFFF" : colors.textMuted}
            >
              {option.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    position: "relative",
    padding: 4, // Padding interno para que el indicador no toque los bordes
  },
  indicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Por encima del indicador animado
  },
});

export default React.memo(AppSegmentedPicker);
