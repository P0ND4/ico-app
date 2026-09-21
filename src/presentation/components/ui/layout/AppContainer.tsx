import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";

/**
 * Every edge, which is the right default for a screen that really does reach the bottom of
 * the device — Profile, Settings, Coupons, Maintenance.
 */
const ALL_EDGES: readonly Edge[] = ["top", "right", "bottom", "left"];

/**
 * The set a screen inside the tab navigator wants.
 *
 * A tab screen does NOT reach the bottom of the device: the tab bar is below it, and that bar
 * already pays the bottom inset itself. Claiming it here as well spends the gap twice — the
 * scroll view ends early, the last card is clipped higher than it should be, and the dead
 * space between it and the bar is the second copy of the inset.
 */
export const TAB_SCREEN_EDGES: readonly Edge[] = ["top", "right", "left"];

type AppContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Defaults to all four. Pass `TAB_SCREEN_EDGES` from a screen inside the tab navigator. */
  edges?: readonly Edge[];
};

const AppContainer = ({ children, style, edges = ALL_EDGES }: AppContainerProps) => {
  const theme = useThemeColors();

  return (
    <SafeAreaView
      edges={edges as Edge[]}
      style={[{ flex: 1, padding: 20, backgroundColor: theme.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
};

export default AppContainer;
