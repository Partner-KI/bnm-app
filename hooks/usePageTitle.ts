import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Setzt `document.title` auf Web für bessere Browser-Tab-Erkennung.
 * Auf Native ist dieser Hook ein No-op.
 *
 * Verwendung:
 *   usePageTitle("Chat");          // → "BNM – Chat"
 *   usePageTitle("Dashboard");     // → "BNM – Dashboard"
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const prev = document.title;
    document.title = title ? `BNM – ${title}` : "BNM";
    return () => {
      document.title = prev;
    };
  }, [title]);
}
