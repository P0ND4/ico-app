import React from "react";
import { useColorScheme, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useThemeColors } from "../../../hooks/useThemeColors";

const AppContainer = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const theme = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={[{ flex: 1, padding: 20, backgroundColor: theme.background }, style]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </SafeAreaView>
  );
};

export default AppContainer;
