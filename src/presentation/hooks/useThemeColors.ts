import { useColorScheme } from "react-native";
import { theme } from "../../config/theme.config";

export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return isDark ? theme.dark.colors : theme.light.colors;
};
