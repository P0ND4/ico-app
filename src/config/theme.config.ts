export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  textPrimary: string;
  textMuted: string;
  border: string;
}

export const lightTheme: ThemeColors = {
  background: "#F8F9FB",
  surface: "#FFFFFF",
  primary: "#3C57A9",
  accent: "#F59E0B",
  textPrimary: "#263047",
  textMuted: "#5F6F8C",
  border: "#E2E8F0",
};

export const darkTheme: ThemeColors = {
  background: "#141A26",
  surface: "#263047",
  primary: "#5E79D4",
  accent: "#FBBF24",
  textPrimary: "#F1F5F9",
  textMuted: "#94A3B8",
  border: "#374667",
};

export const theme = {
  light: {
    colors: lightTheme,
  },
  dark: {
    colors: darkTheme,
  },
} as const;

export type Theme = typeof theme;
