import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import de, { TranslationKeys } from "../lib/translations/de";
import tr from "../lib/translations/tr";
import ar from "../lib/translations/ar";
import en from "../lib/translations/en";

// RTL-Hinweis: Bei Arabisch wäre I18nManager.forceRTL(true) nötig.
// Das ist bewusst NICHT implementiert, da es einen App-Neustart erfordert
// und das gesamte Layout umkehrt — wird in einer späteren Version umgesetzt.

export type Language = "de" | "tr" | "ar" | "en";

const STORAGE_KEY = "bnm_language";

const translations: Record<Language, Record<TranslationKeys, string>> = {
  de,
  tr,
  ar,
  en,
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "de",
  setLanguage: () => {},
  t: (key) => key,
});

// Persistenz: localStorage auf Web, AsyncStorage auf Native (falls verfügbar)
// Falls @react-native-async-storage/async-storage nicht installiert ist,
// wird auf Native keine Persistenz über App-Neustarts hinaus genutzt —
// die Sprache bleibt für die App-Session gespeichert.
async function loadStoredLanguage(): Promise<Language | null> {
  try {
    if (Platform.OS === "web") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored as Language) ?? null;
    } else {
      // Dynamischer Import — schlägt sauber fehl wenn AsyncStorage nicht installiert
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — optionale Abhängigkeit, muss nicht installiert sein
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return (stored as Language) ?? null;
      } catch {
        // AsyncStorage nicht verfügbar — kein Problem, Fallback auf Default-Sprache
        return null;
      }
    }
  } catch {
    return null;
  }
}

async function saveLanguage(lang: Language): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(STORAGE_KEY, lang);
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — optionale Abhängigkeit, muss nicht installiert sein
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        await AsyncStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // AsyncStorage nicht verfügbar — Sprache wird nur für diese Session gespeichert
      }
    }
  } catch {
    // Fehler beim Speichern ist nicht kritisch
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");

  // Gespeicherte Sprache beim Start laden
  useEffect(() => {
    loadStoredLanguage().then((stored) => {
      if (stored) setLanguageState(stored);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKeys): string => {
      const dict = translations[language];
      return dict[key] ?? translations["de"][key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
