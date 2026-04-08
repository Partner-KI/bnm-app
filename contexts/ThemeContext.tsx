import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Platform, useColorScheme } from "react-native";
import { LIGHT_COLORS, DARK_COLORS, type ThemeColors } from "../constants/Colors";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

const STORAGE_KEY = "bnm-theme-mode";

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  isDark: false,
  setMode: () => {},
  colors: LIGHT_COLORS,
});

async function loadStoredThemeMode(): Promise<ThemeMode | null> {
  try {
    if (Platform.OS === "web") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored as ThemeMode) ?? null;
    } else {
      try {
        // @ts-ignore — optionale Abhängigkeit
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return (stored as ThemeMode) ?? null;
      } catch {
        return null;
      }
    }
  } catch {
    return null;
  }
}

async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(STORAGE_KEY, mode);
    } else {
      try {
        // @ts-ignore — optionale Abhängigkeit
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        await AsyncStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // AsyncStorage nicht verfügbar — nur für diese Session
      }
    }
  } catch {
    // Fehler beim Speichern ist nicht kritisch
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("light");

  // Gespeicherten Mode beim Start laden
  useEffect(() => {
    loadStoredThemeMode().then((stored) => {
      if (stored) setModeState(stored);
    });
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    saveThemeMode(newMode);
  }, []);

  // isDark berechnen: bei "system" System-Einstellung folgen
  const isDark =
    mode === "dark" ||
    (mode === "system" && systemColorScheme === "dark");

  const colors: ThemeColors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  // Fallback für Hermes-Timing: falls Context noch nicht verfügbar ist,
  // sichere Defaults zurückgeben statt ReferenceError zu werfen
  if (!context || typeof context.isDark === "undefined") {
    return { mode: "light", isDark: false, setMode: () => {}, colors: LIGHT_COLORS };
  }
  return context;
}

/**
 * Hook der die korrekten Theme-Farben zurückgibt.
 * Screens die Dark Mode unterstützen nutzen diesen Hook
 * statt direkt COLORS oder LIGHT_COLORS zu importieren.
 */
export function useThemeColors(): ThemeColors {
  const { colors } = useTheme();
  return colors;
}
