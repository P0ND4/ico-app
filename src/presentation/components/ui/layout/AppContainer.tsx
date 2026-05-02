import React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const AppContainer = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  return (
    <SafeAreaView style={[{ flex: 1, padding: 20 }, style]}>
      <StatusBar style="auto" />
      {children}
    </SafeAreaView>
  );
};

export default AppContainer;
