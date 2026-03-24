export const COLORS = {
  primary: "#101828",
  secondary: "#475467",
  tertiary: "#98A2B3",
  gold: "#EEA71B",
  cta: "#27ae60",
  link: "#444CE7",
  gradientStart: "#0A3A5A",
  gradientEnd: "#012A46",
  progressGreen: "#2d802f",
  bg: "#F9FAFB",
  card: "#FFFFFF",
  border: "#e5e7eb",
  error: "#dc2626",
  white: "#FFFFFF",
} as const;

// Light Theme Farbpalette
export const LIGHT_COLORS = {
  // Backgrounds
  background: "#F5F5F7",
  card: "#FFFFFF",
  elevated: "#FFFFFF",
  // Text
  text: "#101828",
  textSecondary: "#475467",
  textTertiary: "#98A2B3",
  // Borders
  border: "#E5E7EB",
  // Brand
  primary: "#0A3A5A",
  primaryDark: "#012A46",
  accent: "#EEA71B",
  // Semantic
  success: "#27ae60",
  error: "#dc2626",
  link: "#444CE7",
  // Misc
  white: "#FFFFFF",
  black: "#101828",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E5E7EB",
  tabIconActive: "#101828",
  tabIconInactive: "#98A2B3",
  headerBackground: "#FFFFFF",
  headerText: "#101828",
  statItem: "#F9FAFB",
  input: "#FFFFFF",
} as const;

// Dark Theme Farbpalette — echtes Dunkel (kein Blau)
export const DARK_COLORS = {
  // Backgrounds — Material Dark, neutral-grau
  background: "#121212",
  card: "#1E1E1E",
  elevated: "#252525",
  // Text — gut lesbar auf dunklem Hintergrund
  text: "#F0F0F0",
  textSecondary: "#A0A0A0",
  textTertiary: "#707070",
  // Borders
  border: "#2C2C2C",
  // Brand (unveränderlich)
  primary: "#0A3A5A",
  primaryDark: "#012A46",
  accent: "#EEA71B",
  // Semantic — etwas heller für Dark Mode Kontrast
  success: "#4CAF50",
  error: "#EF5350",
  link: "#64B5F6",
  // Misc
  white: "#F0F0F0",
  black: "#121212",
  tabBar: "#181818",
  tabBarBorder: "#2C2C2C",
  tabIconActive: "#F0F0F0",
  tabIconInactive: "#707070",
  headerBackground: "#181818",
  headerText: "#F0F0F0",
  statItem: "#1A1A1A",
  input: "#2A2A2A",
} as const;

// Lockerer Typ für Theme-Farben (string statt Literal-Typen, damit Light + Dark zuweisbar sind)
export type ThemeColors = {
  [K in keyof typeof LIGHT_COLORS]: string;
};

export default {
  light: {
    text: COLORS.primary,
    background: COLORS.bg,
    tint: COLORS.primary,
    tabIconDefault: COLORS.tertiary,
    tabIconSelected: COLORS.primary,
  },
  dark: {
    text: COLORS.white,
    background: COLORS.primary,
    tint: COLORS.white,
    tabIconDefault: COLORS.tertiary,
    tabIconSelected: COLORS.white,
  },
};
