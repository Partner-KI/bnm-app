import { Alert, Platform } from "react-native";

/**
 * Zeigt eine Fehlermeldung plattformübergreifend an.
 */
export function showError(message: string): void {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("Fehler", message);
  }
}

/**
 * Zeigt eine Info/Erfolgs-Meldung plattformübergreifend an.
 */
export function showSuccess(message: string, onDismiss?: () => void): void {
  if (Platform.OS === "web") {
    window.alert(message);
    onDismiss?.();
  } else {
    Alert.alert("Erfolg", message, [
      { text: "OK", onPress: onDismiss },
    ]);
  }
}

/**
 * Zeigt eine Bestätigungsdialog plattformübergreifend an.
 * Gibt true zurück wenn bestätigt, false wenn abgebrochen.
 */
export function showConfirm(
  title: string,
  message: string
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(message));
  }
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: "Abbrechen", style: "cancel", onPress: () => resolve(false) },
      { text: "Bestätigen", onPress: () => resolve(true) },
    ])
  );
}
