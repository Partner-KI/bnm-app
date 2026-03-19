import { Platform } from "react-native";
import { supabase } from "./supabase";

// Expo-APIs nur auf Native importieren — auf Web nicht verfügbar
let Notifications: any = null;
let Device: any = null;
let Constants: any = null;

if (Platform.OS !== "web") {
  Notifications = require("expo-notifications");
  Device = require("expo-device");
  Constants = require("expo-constants");
}

// Notification Handler: Verhalten wenn App im Vordergrund ist
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Push Token vom Expo-Service holen und in der DB (profiles.push_token) speichern.
 * Gibt den Token zurück oder null (Web / kein echtes Gerät / Berechtigung verweigert).
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  // Web und Simulator überspringen
  if (Platform.OS === "web" || !Device || !Notifications || !Constants) {
    return null;
  }

  if (!Device.isDevice) {
    // Im Simulator keine Push Tokens verfügbar
    return null;
  }

  // Bestehende Berechtigung prüfen
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // Project ID aus app.json/app.config.ts lesen
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    // Kein EAS Project ID konfiguriert — lokal (Expo Go) trotzdem versuchen
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      await supabase
        .from("profiles")
        .update({ push_token: token })
        .eq("id", userId);

      return token;
    } catch {
      return null;
    }
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", userId);

    return token;
  } catch {
    return null;
  }
}

/**
 * Push Token aus der DB entfernen (beim Logout).
 */
export async function unregisterPushToken(userId: string): Promise<void> {
  if (Platform.OS === "web") return;

  await supabase
    .from("profiles")
    .update({ push_token: null })
    .eq("id", userId);
}

/**
 * Sofortige lokale Notification anzeigen (Foreground-Fallback).
 * Auf Web: kein Aufruf nötig, da in-App Notifications über die notifications-Tabelle laufen.
 */
export async function sendLocalNotification(
  title: string,
  body: string
): Promise<void> {
  if (Platform.OS === "web" || !Notifications) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // sofort anzeigen
  });
}
