import type { Mentorship, Session, Notification, Feedback } from '../types';

const REMINDER_THRESHOLD_DAYS = 5;
const REMINDER_COOLDOWN_DAYS = 5;
const MENTEE_SESSION_DUE_DAYS = 7;

/**
 * Prüft ob Mentoren Erinnerungen bekommen sollten.
 * Wird beim App-Start client-seitig aufgerufen.
 * Ersetzt später durch Supabase Edge Function / pg_cron (siehe supabase/edge-functions.sql).
 *
 * Logik:
 * - Für jeden aktiven Mentorship des eingeloggten Mentors:
 *   - Wenn die letzte Session > 3 Tage zurückliegt → Erinnerung generieren
 *   - Aber nur wenn noch keine Erinnerung in den letzten 2 Tagen existiert
 *
 * @returns Array von Notification-Objekten (ohne id/created_at) zum Einfügen in die DB
 */
export function checkReminders(
  mentorships: Mentorship[],
  sessions: Session[],
  notifications: Notification[],
  currentUserId: string
): Array<Omit<Notification, 'id' | 'created_at' | 'read'>> {
  const now = Date.now();
  const thresholdMs = REMINDER_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  const cooldownMs = REMINDER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

  const result: Array<Omit<Notification, 'id' | 'created_at' | 'read'>> = [];

  // Nur aktive Mentorships bei denen der aktuelle User Mentor ist
  const myActiveMentorships = mentorships.filter(
    (m) => m.mentor_id === currentUserId && m.status === 'active'
  );

  for (const mentorship of myActiveMentorships) {
    // Letzte Session dieser Mentorship ermitteln
    const mentorshipSessions = sessions
      .filter((s) => s.mentorship_id === mentorship.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastSession = mentorshipSessions[0];
    const lastSessionTime = lastSession
      ? new Date(lastSession.date).getTime()
      : new Date(mentorship.assigned_at).getTime();

    const daysSinceLastSession = now - lastSessionTime;

    // Schwellwert überschritten?
    if (daysSinceLastSession <= thresholdMs) continue;

    // Bereits eine ungelesene Erinnerung vorhanden ODER eine innerhalb des Cooldowns?
    // → Keine neue erstellen, sonst wächst der Badge mit jeder App-Öffnung.
    const existingReminder = notifications.find(
      (n) =>
        n.type === 'reminder' &&
        n.related_id === mentorship.id &&
        (!n.read || now - new Date(n.created_at).getTime() < cooldownMs)
    );
    if (existingReminder) continue;

    // Erinnerung generieren
    const menteeName = mentorship.mentee?.name ?? 'deinem Mentee';
    result.push({
      type: 'reminder',
      title: 'Erinnerung: Session dokumentieren',
      body: `Bitte dokumentiere deine letzte Session mit ${menteeName}.`,
      related_id: mentorship.id,
    });
  }

  return result;
}

/**
 * Prüft Mentee-spezifische Erinnerungen:
 * 1. Feedback-Erinnerung: Betreuung abgeschlossen/abgebrochen aber kein Feedback gegeben
 * 2. Session-fällig: Aktive Betreuung aber letzte Session > 7 Tage her
 *
 * @returns Array von Notification-Objekten (ohne id/created_at) zum Einfügen in die DB
 */
export function checkMenteeReminders(
  mentorships: Mentorship[],
  sessions: Session[],
  notifications: Notification[],
  feedback: Feedback[],
  currentUserId: string
): Array<Omit<Notification, 'id' | 'created_at' | 'read'>> {
  const now = Date.now();
  const cooldownMs = REMINDER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const sessionDueMs = MENTEE_SESSION_DUE_DAYS * 24 * 60 * 60 * 1000;

  const result: Array<Omit<Notification, 'id' | 'created_at' | 'read'>> = [];

  // Nur Mentorships bei denen der aktuelle User Mentee ist
  const myMentorships = mentorships.filter((m) => m.mentee_id === currentUserId);

  for (const mentorship of myMentorships) {
    // ── 1. Feedback-Erinnerung ──
    // Wenn Betreuung abgeschlossen oder abgebrochen und kein Feedback vom Mentee
    if (mentorship.status === 'completed' || mentorship.status === 'cancelled') {
      const hasFeedback = feedback.some(
        (f) => f.mentorship_id === mentorship.id && f.submitted_by === currentUserId
      );

      if (!hasFeedback) {
        // Bereits eine ungelesene oder kürzliche Erinnerung?
        const existingFeedbackReminder = notifications.find(
          (n) =>
            n.type === 'feedback' &&
            n.related_id === mentorship.id &&
            (!n.read || now - new Date(n.created_at).getTime() < cooldownMs)
        );

        if (!existingFeedbackReminder) {
          const mentorName = mentorship.mentor?.name ?? 'deinem Mentor';
          result.push({
            type: 'feedback',
            title: 'Feedback ausstehend',
            body: `Bitte gib Feedback zu deiner Betreuung mit ${mentorName}.`,
            related_id: mentorship.id,
          });
        }
      }
    }

    // ── 2. Session-fällig-Erinnerung ──
    // Aktive Betreuung und letzte Session > 7 Tage her
    if (mentorship.status === 'active') {
      const mentorshipSessions = sessions
        .filter((s) => s.mentorship_id === mentorship.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const lastSession = mentorshipSessions[0];
      const lastTime = lastSession
        ? new Date(lastSession.date).getTime()
        : new Date(mentorship.assigned_at).getTime();

      if (now - lastTime > sessionDueMs) {
        const existingSessionReminder = notifications.find(
          (n) =>
            n.type === 'reminder' &&
            n.related_id === mentorship.id &&
            (!n.read || now - new Date(n.created_at).getTime() < cooldownMs)
        );

        if (!existingSessionReminder) {
          result.push({
            type: 'reminder',
            title: 'Deine nächste Session steht an',
            body: 'Es ist über eine Woche seit deiner letzten Session. Melde dich bei deinem Mentor!',
            related_id: mentorship.id,
          });
        }
      }
    }
  }

  return result;
}
