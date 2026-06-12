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
          paddingBottom: Math.max(insets.bottom, 10),
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

const styles = StyleSheet.create({
  safeWrapper: {
    paddingHorizontal: 16,
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
