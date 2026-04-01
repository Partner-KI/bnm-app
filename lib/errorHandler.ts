import { Alert, Platform } from "react-native";
import { getGlobalShowConfirm, getGlobalShowAlert } from "../contexts/ModalContext";

// Globale Toast-Referenz – wird von ToastProvider gesetzt
let _globalToast: ((message: string, type: "success" | "error" | "warning" | "info") => void) | null = null;

export function setGlobalToast(fn: typeof _globalToast) {
  _globalToast = fn;
}

/**
 * Zeigt eine Fehlermeldung plattformübergreifend an.
 * Web: Toast-Notification (non-blocking), Mobile: Nativer Alert
 */
export function showError(message: string): void {
  // Toast zuerst versuchen (non-blocking, bessere UX)
  if (_globalToast) {
    _globalToast(message, "error");
    return;
  }
  if (Platform.OS !== "web") {
    Alert.alert("Fehler", message);
    return;
  }
  const globalAlert = getGlobalShowAlert();
  if (globalAlert) {
    globalAlert("Fehler", message, "error");
    return;
  }
  window.alert(message);
}

/**
 * Zeigt eine Erfolgs-/Info-Meldung plattformübergreifend an.
 * Web: Toast-Notification (non-blocking), Mobile: Nativer Alert
 */
export function showSuccess(message: string, onDismiss?: () => void): void {
  // Toast zuerst versuchen (non-blocking, bessere UX)
  if (_globalToast) {
    _globalToast(message, "success");
    onDismiss?.();
    return;
  }
  if (Platform.OS !== "web") {
    Alert.alert("Erfolg", message, [{ text: "OK", onPress: onDismiss }]);
    return;
  }
  const globalAlert = getGlobalShowAlert();
  if (globalAlert) {
    globalAlert("Erfolg", message, "success").then(() => onDismiss?.());
    return;
  }
  window.alert(message);
  onDismiss?.();
}

/**
 * Zeigt einen Bestätigungsdialog plattformübergreifend an.
 * Web: Custom-Modal, Mobile: Nativer Alert (kein Hänger auf iOS)
 */
export async function showConfirm(
  title: string,
  message: string
): Promise<boolean> {
  if (Platform.OS !== "web") {
    return new Promise((resolve) =>
      Alert.alert(title, message, [
        { text: "Abbrechen", style: "cancel", onPress: () => resolve(false) },
        { text: "Bestätigen", onPress: () => resolve(true) },
      ])
    );
  }
  const globalConfirm = getGlobalShowConfirm();
  if (globalConfirm) {
    return globalConfirm(title, message);
  }
  return Promise.resolve(window.confirm(message));
}
