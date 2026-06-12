import { useColorScheme } from "react-native";
import { theme } from "../../config/theme.config";
import { useAppSelector } from "../../application/store/hooks";
import { selectThemeMode } from "../../application/selectors/user.selectors";

export const useIsDarkMode = () => {
  const themeMode = useAppSelector(selectThemeMode);
  const systemScheme = useColorScheme();
  return themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
};

export const useThemeColors = () => {
  const isDark = useIsDarkMode();
  return isDark ? theme.dark.colors : theme.light.colors;
};
