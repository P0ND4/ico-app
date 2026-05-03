export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  textPrimary: string;
  textMuted: string;
  border: string;
  success: string;
  danger: string;
  cardShadow: string;
  textOnPrimary: string;
  textOnSurface: string;
}

export const lightTheme: ThemeColors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceElevated: "#F1F5F9",
  primary: "#059669",
  primaryLight: "#ECFDF5",
  accent: "#0891B2",
  accentLight: "#ECFEFF",
  textPrimary: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
  cardShadow: "rgba(5, 150, 105, 0.08)",
  textOnPrimary: "#FFFFFF",
  textOnSurface: "#0F172A",
};

export const darkTheme: ThemeColors = {
  background: "#0F172A",
  surface: "#1E293B",
  surfaceElevated: "#334155",
  primary: "#10B981",
  primaryLight: "#064E3B",
  accent: "#22D3EE",
  accentLight: "#083344",
  textPrimary: "#F1F5F9",
  textMuted: "#64748B",
  border: "#334155",
  success: "#34D399",
  danger: "#F87171",
  cardShadow: "rgba(0, 0, 0, 0.4)",
  textOnPrimary: "#FFFFFF",
  textOnSurface: "#F1F5F9",
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