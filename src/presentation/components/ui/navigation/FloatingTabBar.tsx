import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../typography/AppText";

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

interface TabOptions {
  tabBarLabel?: string | ((props: { focused: boolean; color: string; tintColor?: string }) => React.ReactNode);
  title?: string;
  tabBarIcon?: (props: TabIconProps) => React.ReactNode;
}

interface FloatingTabBarProps {
  state: {
    routes: Array<{ key: string; name: string; params?: object }>;
    index: number;
  };
  descriptors: Record<string, { options: TabOptions }>;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
}

const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.safeWrapper,
        {
          // insets.bottom + a gap, never Math.max of the two. They answer different
          // questions: the inset is how much of the screen the system gesture area eats,
          // the gap is how far a floating pill should sit off the edge. Taking the larger
          // means that on a phone whose inset already exceeds the gap the pill gets NO
          // breathing room at all and lands against the bottom of the screen.
          paddingBottom: insets.bottom + BOTTOM_GAP,
          backgroundColor: theme.background,
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const { options } = descriptor;
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const iconEl = options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? theme.primary : theme.textMuted,
            size: 22,
          });

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <View
                style={[
                  styles.iconWrap,
                  isFocused && {
                    backgroundColor: `${theme.primary}18`,
                    borderRadius: 16,
                  },
                ]}
              >
                {iconEl}
              </View>
              <AppText
                variant="verySmall"
                color={isFocused ? theme.primary : theme.textMuted}
                weight={isFocused ? "700" : "normal"}
              >
                {label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Visual breathing room under the pill, on top of whatever the system reserves.
 *
 * It has to carry the whole gap on its own wherever the system reserves nothing — an
 * emulator, or a phone with hardware keys, both report insets.bottom = 0 — so this is the
 * number to move if the bar ever reads too tight or too loose.
 */
const BOTTOM_GAP = 22;

/** Air between the last thing the screen drew and the top of the pill. */
const TOP_GAP = 24;

const styles = StyleSheet.create({
  safeWrapper: {
    paddingHorizontal: 16,
    paddingTop: TOP_GAP,
  },
  pill: {
    flexDirection: "row",
    borderRadius: 28,
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 4,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  iconWrap: {
    width: 44,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FloatingTabBar;
