import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemeColors } from "../../hooks/useThemeColors";
import PaywallContent from "./PaywallContent";

const PaywallScreen = () => {
  const theme = useThemeColors();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[s.container, { backgroundColor: theme.background }]}>
      <View style={s.content}>
        <PaywallContent onClose={() => router.back()} showCloseButton />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});

export default PaywallScreen;
