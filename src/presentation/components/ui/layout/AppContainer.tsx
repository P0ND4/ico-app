import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";

const AppContainer = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const theme = useThemeColors();

  return (
    <SafeAreaView style={[{ flex: 1, padding: 20, backgroundColor: theme.background }, style]}>
      {children}
    </SafeAreaView>
  );
};

export default AppContainer;
