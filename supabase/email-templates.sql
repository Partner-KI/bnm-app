-- ============================================================
-- E-Mail-Vorlagen: template_key Spalte + Default-Templates
-- Ermöglicht Admin, E-Mail-Texte im UI zu ändern.
-- emailService.ts nutzt template_key zum Lookup.
--
-- Dieses Statement in Supabase SQL-Editor ausführen.
-- ============================================================

-- 1) Neue Spalte template_key (systeminterner Schlüssel)
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS template_key TEXT DEFAULT NULL;

-- 2) Default E-Mail-Vorlagen mit template_key
INSERT INTO message_templates (title, category, body, sort_order, is_active, template_key)
VALUES
  ('[E-Mail] Willkommen als Mentor', 'email', 'Betreff: [BNM] Deine Zugangsdaten
---
Salam Aleikum {name},

dein BNM-Account wurde erstellt. Hier sind deine Zugangsdaten:

E-Mail: {email}
Temporäres Passwort: {password}

Bitte ändere dein Passwort nach dem ersten Login.

Barakallahu fik
Das BNM-Team', 100, true, 'welcome_mentor'),

  ('[E-Mail] Bewerbung abgelehnt', 'email', 'Betreff: [BNM] Rückmeldung zu deiner Bewerbung
---
Salam Aleikum {name},

vielen Dank für dein Interesse an BNM.

Leider können wir deine Bewerbung derzeit nicht berücksichtigen.
Grund: {reason}

Dein BNM-Team', 101, true, 'rejection'),

  ('[E-Mail] Einladung zum Gespräch', 'email', 'Betreff: [BNM] Einladung zum Gespräch
---
Salam Aleikum {name},

vielen Dank für deine Bewerbung bei BNM.

Wir würden dich gerne zu einem persönlichen Gespräch einladen.

Bitte antworte auf diese E-Mail mit deinen Verfügbarkeiten.

Barakallahu fik
Das BNM-Team', 102, true, 'interview_invitation'),

  ('[E-Mail] Einladung zum Webinar', 'email', 'Betreff: [BNM] Einladung zum Einführungswebinar
---
Salam Aleikum {name},

vielen Dank für deine Bewerbung bei BNM.

Wir möchten dich herzlich zum Einführungswebinar einladen.

Weitere Details zum Termin folgen in Kürze.

Barakallahu fik
Das BNM-Team', 103, true, 'webinar_invitation'),

  ('[E-Mail] Feedback anfordern', 'email', 'Betreff: [BNM] Bitte gib Feedback zu deiner Betreuung
---
Salam Aleikum {name},

deine Betreuung mit {mentor_name} wurde abgeschlossen.

Bitte öffne die BNM-App und gib dein Feedback ab.

Barakallahu fik
Das BNM-Team', 104, true, 'feedback_request'),

  ('[E-Mail] Betreuung beendet', 'email', 'Betreff: [BNM] Deine Betreuung wurde beendet
---
Salam Aleikum {name},

deine Betreuung mit {mentor_name} wurde leider beendet.

Bitte gib uns dein Feedback in der BNM-App.

Barakallahu fik
Das BNM-Team', 105, true, 'mentorship_cancelled'),

  ('[E-Mail] Mentor zugewiesen', 'email', 'Betreff: [BNM] Dir wurde ein Mentee zugewiesen
---
Salam Aleikum {name},

dir wurde ein neuer Mentee zugewiesen: {mentee_name} aus {mentee_city}.

Bitte melde dich zeitnah in der App, um den ersten Kontakt herzustellen.

Barakallahu fik
Das BNM-Team', 106, true, 'mentor_assigned')
ON CONFLICT DO NOTHING;
