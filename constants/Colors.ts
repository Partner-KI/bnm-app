export const COLORS = {
  primary: "#101828",
  secondary: "#475467",
  tertiary: "#98A2B3",
  gold: "#EEA71B",
  goldDeep: "#D4920F",        // Dunkleres Gold für Hover/Active
  cta: "#0D9C6E",             // Satteres Grün
  link: "#444CE7",
  gradientStart: "#0A3A5A",
  gradientEnd: "#012A46",
  progressGreen: "#0D9C6E",
  bg: "#F8F7F4",              // Warmes Weiß statt kühles Grau
  card: "#FFFFFF",
  border: "#e5e7eb",
  error: "#dc2626",
  white: "#FFFFFF",
} as const;

// Typography-Token-System
export const TYPOGRAPHY = {
  // Größen
  size: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 28,
    hero: 34,
    jumbo: 42,
  },
  // Gewichte
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  // Zeilenhöhen
  lineHeight: {
    tight: 16,
    normal: 20,
    relaxed: 22,
    loose: 24,
    heading: 30,
  },
  // Letter-Spacing
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 1.5,
    caps: 0.8,       // Für uppercase Labels
  },
  // Fertige Text-Styles (copy-paste ready)
  styles: {
    h1: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5, lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3, lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: "600" as const, letterSpacing: -0.2, lineHeight: 24 },
    h4: { fontSize: 15, fontWeight: "600" as const, letterSpacing: -0.1, lineHeight: 20 },
    body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 22 },
    bodyMedium: { fontSize: 14, fontWeight: "500" as const, lineHeight: 22 },
    bodySmall: { fontSize: 13, fontWeight: "400" as const, lineHeight: 20 },
    label: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.8, lineHeight: 16 },
    labelLarge: { fontSize: 13, fontWeight: "600" as const, letterSpacing: 0.3, lineHeight: 18 },
    caption: { fontSize: 11, fontWeight: "400" as const, lineHeight: 16 },
    button: { fontSize: 14, fontWeight: "600" as const, letterSpacing: 0.2 },
  },
} as const;

// Design-Tokens für konsistentes Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Radius-Skala — leicht aufgewertet für moderneres Gefühl
export const RADIUS = {
  xs: 6,    // Mini-Badges, Tags
  sm: 10,   // war 8 — kleine Chips, Buttons
  md: 14,   // war 12 — Standard: Inputs, Cards
  lg: 18,   // war 16 — Modals, Sheets
  xl: 24,   // war 20 — Hero-Cards
  full: 999,
} as const;

// Farbige Schatten — mehr Tiefe, weniger "generisch schwarz"
export const SHADOWS = {
  sm: {
    shadowColor: "#0A3A5A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#0A3A5A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: "#0A3A5A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  // Gold-Glow für featured/aktive Elemente
  gold: {
    shadowColor: "#EEA71B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 5,
  },
  // Farbloser Glow für beliebige Farbe
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  }),
} as const;

// ─── Light Theme ──────────────────────────────────────────────────────────────
export const LIGHT_COLORS = {
  // Backgrounds
  background: "#F8F7F4",        // Warmes Weiß
  card: "#FFFFFF",
  elevated: "#FFFFFF",
  surface: "#F1EFE9",           // Für gruppierte Sektionen, leicht getönt

  // Text — etwas mehr Kontrast
  text: "#0F1923",
  textSecondary: "#4A5568",
  textTertiary: "#6B7280",      // war #98A2B3 — besser WCAG AA Kontrast
  textInverse: "#FFFFFF",

  // Borders
  border: "#E2E8F0",
  borderFocus: "#0A3A5A",       // Fokussierter Input-Border

  // Brand
  primary: "#0A3A5A",
  primaryDark: "#012A46",
  primaryLight: "#EAF3FB",      // Heller Blau-Tint für Hover/Highlights
  accent: "#EEA71B",
  accentLight: "#FFF8E6",       // Heller Gold-Tint für Hintergründe

  // Semantic
  success: "#0D9C6E",
  successLight: "#ECFDF5",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  error: "#dc2626",
  errorLight: "#FEF2F2",
  info: "#0284C7",
  infoLight: "#F0F9FF",
  link: "#444CE7",

  // Misc
  white: "#FFFFFF",
  black: "#0F1923",

  // Navigation
  tabBar: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  tabIconActive: "#0A3A5A",     // Primärblau im Light Mode
  tabIconInactive: "#94A3B8",
  headerBackground: "#FFFFFF",
  headerText: "#0F1923",
  statItem: "#F8F7F4",
  input: "#FFFFFF",
} as const;

// ─── Dark Theme — tiefes Blau-Schwarz ─────────────────────────────────────────
export const DARK_COLORS = {
  // Backgrounds — leichter Blauton für mehr Tiefe als reines Grau
  background: "#0B0F18",
  card: "#131926",
  elevated: "#1A2233",
  surface: "#0F1520",

  // Text
  text: "#F1F5F9",
  textSecondary: "#8B95A5",
  textTertiary: "#5B6475",
  textInverse: "#0B0F18",

  // Borders
  border: "#1E2D40",
  borderFocus: "#1A5C8A",

  // Brand
  primary: "#1A5C8A",           // Heller im Dark Mode sichtbar
  primaryDark: "#0A3A5A",
  primaryLight: "#0D2540",
  accent: "#EEA71B",            // Gold bleibt konstant
  accentLight: "#2A1F00",

  // Semantic
  success: "#10B981",
  successLight: "#052E16",
  warning: "#F59E0B",
  warningLight: "#1C1300",
  error: "#EF5350",
  errorLight: "#2D0808",
  info: "#38BDF8",
  infoLight: "#0C1F2E",
  link: "#60A5FA",

  // Misc
  white: "#F1F5F9",
  black: "#0B0F18",

  // Navigation
  tabBar: "#0B0F18",
  tabBarBorder: "#1E2D40",
  tabIconActive: "#EEA71B",     // ✨ Gold im Dark Mode — Premium-Gefühl
  tabIconInactive: "#4B5563",
  headerBackground: "#0B0F18",
  headerText: "#F1F5F9",
  statItem: "#131926",
  input: "#1A2233",
} as const;

// Lockerer Typ für Theme-Farben
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
