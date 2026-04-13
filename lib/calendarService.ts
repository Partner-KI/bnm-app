import { Platform, Alert } from "react-native";
import type { CalendarEvent } from "../types";

// ============================================================
// Calendar Service — iCal Export + Google Calendar Integration
// iCal/Google-URL funktioniert sofort, Google OAuth braucht
// eine konfigurierte GOOGLE_CLIENT_ID.
// ============================================================

// ─── Google OAuth Konfiguration ────────────────────────────────────────────────

const GOOGLE_CLIENT_ID = ""; // Muss konfiguriert werden
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// ─── Hilfsfunktionen ───────────────────────────────────────────────────────────

/** ISO-Datum → Google Calendar Format (YYYYMMDDTHHmmSSZ) */
function toGoogleDateFormat(isoDate: string): string {
  const d = new Date(isoDate);
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** ISO-Datum → iCal Format (YYYYMMDDTHHmmSSZ) */
function toICalDateFormat(isoDate: string): string {
  const d = new Date(isoDate);
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** Standard-Endzeit: 1 Stunde nach Start falls kein end_at */
function getEndDate(startAt: string, endAt?: string | null): string {
  if (endAt) return endAt;
  const d = new Date(startAt);
  d.setHours(d.getHours() + 1);
  return d.toISOString();
}

/** Text für iCal escapen (Zeilenumbrüche, Kommas, Semikolons) */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// ─── 1. iCal Export ────────────────────────────────────────────────────────────

/**
 * Generiert einen validen .ics-String (VCALENDAR mit VEVENT).
 * Funktioniert ohne Google OAuth — reines iCal-Format.
 */
export function generateICalEvent(event: {
  title: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  location?: string;
}): string {
  const dtStart = toICalDateFormat(event.start_at);
  const dtEnd = toICalDateFormat(getEndDate(event.start_at, event.end_at));
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@bnm-app`;
  const now = toICalDateFormat(new Date().toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BNM-App//BNM Kalender//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICalText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Generiert eine Google Calendar "Event hinzufügen"-URL.
 * Der User kann den Link öffnen und den Termin direkt übernehmen.
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  location?: string;
}): string {
  const dtStart = toGoogleDateFormat(event.start_at);
  const dtEnd = toGoogleDateFormat(getEndDate(event.start_at, event.end_at));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${dtStart}/${dtEnd}`,
  });

  if (event.description) {
    params.set("details", event.description);
  }
  if (event.location) {
    params.set("location", event.location);
  }

  return `https://calendar.google.com/calendar/event?${params.toString()}`;
}

/**
 * Lädt eine .ics-Datei herunter (nur Web).
 * Erstellt einen Blob + Download-Link im DOM.
 */
export function downloadICalFile(event: {
  title: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  location?: string;
}): void {
  if (Platform.OS !== "web") {
    console.warn("[calendarService] downloadICalFile ist nur auf Web verfügbar");
    return;
  }

  const icsContent = generateICalEvent(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const filename = `${event.title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").replace(/\s+/g, "-")}.ics`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Aufräumen
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

// ─── 2. Google Calendar OAuth ──────────────────────────────────────────────────

/**
 * Startet den Google OAuth Flow.
 * Aktuell ein Stub — zeigt einen Hinweis, bis GOOGLE_CLIENT_ID konfiguriert ist.
 * Sobald die Client ID gesetzt ist, öffnet sich der OAuth-Popup.
 */
export async function initiateGoogleAuth(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  if (!GOOGLE_CLIENT_ID) {
    Alert.alert(
      "Google Calendar",
      "Google Calendar wird konfiguriert — OAuth Client ID nötig. Bitte den Administrator kontaktieren."
    );
    return null;
  }

  try {
    if (Platform.OS === "web") {
      // Web: Popup-basierter OAuth Flow
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(SCOPES)}` +
        `&access_type=offline` +
        `&prompt=consent`;

      return new Promise((resolve) => {
        const popup = window.open(authUrl, "google-auth", "width=500,height=600");
        if (!popup) {
          Alert.alert("Fehler", "Popup wurde blockiert. Bitte Popup-Blocker deaktivieren.");
          resolve(null);
          return;
        }

        // Auf Redirect-Nachricht vom Popup warten
        const handleMessage = (e: MessageEvent) => {
          if (e.data?.type === "google-auth-callback" && e.data?.code) {
            window.removeEventListener("message", handleMessage);
            // Auth-Code gegen Tokens tauschen
            exchangeCodeForTokens(e.data.code, redirectUri)
              .then(resolve)
              .catch(() => resolve(null));
          }
        };
        window.addEventListener("message", handleMessage);

        // Timeout: Popup geschlossen ohne Auth
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", handleMessage);
            resolve(null);
          }
        }, 1000);
      });
    } else {
      // Native: expo-web-browser oder expo-auth-session (wenn installiert)
      Alert.alert(
        "Google Calendar",
        "Google Calendar OAuth ist auf nativen Plattformen noch nicht konfiguriert."
      );
      return null;
    }
  } catch (err) {
    console.error("[calendarService] initiateGoogleAuth Fehler:", err);
    return null;
  }
}

/** Auth-Code gegen Access + Refresh Token tauschen */
async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!res.ok) {
      console.error("[calendarService] Token-Tausch fehlgeschlagen:", res.status);
      return null;
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch (err) {
    console.error("[calendarService] exchangeCodeForTokens Fehler:", err);
    return null;
  }
}

/**
 * Synchronisiert ein Event zum Google Calendar des Users.
 * Gibt die Google Event ID zurück (zum Speichern in der DB).
 */
export async function syncEventToGoogle(
  event: CalendarEvent,
  accessToken: string
): Promise<string | null> {
  if (!accessToken) {
    console.warn("[calendarService] Kein Access Token für Google Sync");
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const googleEvent = {
      summary: event.title,
      description: event.description || "",
      location: event.location || "",
      start: {
        dateTime: event.start_at,
        timeZone: "Europe/Berlin",
      },
      end: {
        dateTime: getEndDate(event.start_at, event.end_at),
        timeZone: "Europe/Berlin",
      },
    };

    const res = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(googleEvent),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[calendarService] Google Sync fehlgeschlagen:", res.status, errorText);
      return null;
    }

    const data = await res.json();
    console.log("[calendarService] Event synchronisiert:", data.id);
    return data.id as string;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error("[calendarService] Google Sync Timeout (10s)");
    } else {
      console.error("[calendarService] syncEventToGoogle Fehler:", err);
    }
    return null;
  }
}

/**
 * Löscht ein Event aus dem Google Calendar.
 */
export async function removeEventFromGoogle(
  googleEventId: string,
  accessToken: string
): Promise<void> {
  if (!accessToken || !googleEventId) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events/${encodeURIComponent(googleEventId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok && res.status !== 404) {
      const errorText = await res.text();
      console.error("[calendarService] Google Event löschen fehlgeschlagen:", res.status, errorText);
    } else {
      console.log("[calendarService] Google Event gelöscht:", googleEventId);
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error("[calendarService] Google Delete Timeout (10s)");
    } else {
      console.error("[calendarService] removeEventFromGoogle Fehler:", err);
    }
  }
}

/**
 * Erneuert ein abgelaufenes Google Access Token via Refresh Token.
 * Gibt das neue Access Token zurück oder null bei Fehler.
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID) {
    console.warn("[calendarService] GOOGLE_CLIENT_ID nicht konfiguriert");
    return null;
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!res.ok) {
      console.error("[calendarService] Token-Refresh fehlgeschlagen:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("[calendarService] Token erneuert");
    return data.access_token as string;
  } catch (err) {
    console.error("[calendarService] refreshGoogleToken Fehler:", err);
    return null;
  }
}
