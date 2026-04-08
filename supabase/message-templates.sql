-- ============================================================
-- Nachrichtenvorlagen für Mentoren im Chat.
-- Platzhalter: {{NAME}}, {{ANREDE}} (Bruder/Schwester), {{MENTOR_NAME}}
-- Admin kann Vorlagen im Dashboard verwalten.
--
-- Dieses Statement in Supabase SQL-Editor ausführen.
-- ============================================================

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Alle eingeloggten User dürfen Vorlagen lesen
-- auth.uid() IS NOT NULL ist robuster als auth.role() = 'authenticated'
DROP POLICY IF EXISTS "templates_select" ON message_templates;
CREATE POLICY "templates_select" ON message_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Nur Admin/Office dürfen Vorlagen erstellen/bearbeiten/löschen
CREATE POLICY "templates_admin_insert" ON message_templates
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'office')
  );

CREATE POLICY "templates_admin_update" ON message_templates
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'office')
  );

CREATE POLICY "templates_admin_delete" ON message_templates
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'office')
  );

-- ─── Seed-Daten: 5 Standard-Vorlagen ────────────────────────────────────────

INSERT INTO message_templates (title, category, body, sort_order) VALUES

('Kontaktaufnahme', 'erstkontakt',
'As salamu alaykum (Friede sei mit dir) und herzliche Grüße liebe/r {{ANREDE}},

ich hoffe dir geht es gut und du befindest dich bei bester Gesundheit!

Mein Name ist {{MENTOR_NAME}} und ich freue mich dein/e Mentor/in zu sein und dich im BNM Mentoring unterstützen zu können. Du wirst jetzt womöglich einige Fragen hinsichtlich des BNM Mentoring haben und dafür bin ich ja da :)

Ich würde mich sehr freuen, wenn wir uns die Tage ganz entspannt telefonisch austauschen und uns kennenlernen. Natürlich beantworte ich dir gerne vorab all deine Fragen.

Du kannst mich dafür auch per WhatsApp oder Signal kontaktieren, wenn du das bevorzugst. Lass mich wissen, wann es dir zeitlich passt.

Ich freue mich auf deine Rückmeldung.

Liebe Grüße und viel Erfolg.', 1),

('All-In (letzter Versuch)', 'reaktivierung',
'As salamu alaykum,

ich hoffe es geht dir und deiner Familie gut und ihr seid bei bester Gesundheit.

Leider hat sich noch immer kein Meeting ergeben, was sehr schade ist, da ich davon überzeugt bin, dass das Mentoring dir sehr helfen wird deine Beziehung zu Allah zu stärken und den Islam zu erlernen.

Aber ich werde dich nicht weiter stören und hoffe, dass du dich meldest, wenn du bereit bist das Mentoring erneut aufzunehmen. Ich würde mich sehr freuen.

Möge Allah dich stärken und dich festigen in deinem Glauben.

Beste Grüße', 2),

('Reaktivierung (nach Kontakt)', 'reaktivierung',
'As salamu alaykum {{NAME}},

ich grüße dich {{ANREDE}}. Es ist bereits einige Zeit vergangen und ich muss dir sagen, in den letzten Tagen warst du öfters in meinen Gedanken.

Manchmal hat man schwierige oder stressige Phasen im Leben und schiebt verschiedene Dinge auf, weil man abwarten will, dass sich die Situation ändert, damit man sich endlich auf etwas Anderes konzentrieren kann. Aber entspricht das wirklich der Realität? Aus meiner langen Erfahrung kann ich sagen, dass auf eine Schwierigkeit sofort die nächste folgt, und meistens wartet sie nicht, bis das Problem gelöst ist.

Allah ändert unsere Situation solange nicht, bis wir uns selbst ändern. Das bedeutet unter anderem, dass wir unsere Prioritäten richtig setzen müssen. Lass mich dir dabei helfen, in sha Allah. Bislang hat es ja mit dem Mentoring leider nicht geklappt. Wie schön wäre es, wenn sich das jetzt ändert?

Möge Allah dir deine Angelegenheiten erleichtern. Amin.

Bis bald in sha Allah, {{MENTOR_NAME}}', 3),

('Reaktivierung (nicht erreichbar)', 'reaktivierung',
'As salamu alaykum {{NAME}},

ich grüße dich {{ANREDE}}. Es ist schon einige Zeit vergangen, seitdem ich dich kontaktiert habe und leider habe ich bis heute keine Rückmeldung von dir erhalten. Also dachte ich, ich versuche es einfach noch einmal, in der Hoffnung, dass ich diesmal mehr Erfolg habe :)

Manchmal hat man schwierige oder stressige Phasen im Leben und schiebt verschiedene Dinge auf, weil man abwarten will, dass sich die Situation ändert, damit man sich endlich auf etwas Anderes konzentrieren kann. Vielleicht geht es dir so mit dem Mentoring?

Allah ändert unsere Situation solange nicht, bis wir uns selbst ändern. Das bedeutet unter anderem, dass wir unsere Prioritäten richtig setzen müssen. Lass mich dir dabei helfen, in sha Allah.

Möge Allah dir deine Angelegenheiten erleichtern. Amin.

Bis bald in sha Allah, {{MENTOR_NAME}}', 4),

('Keine Reaktion nach Anruf', 'nachfassen',
'As salamu alaykum {{ANREDE}} {{NAME}},

hattest du Gelegenheit, über meine Worte nachzudenken und würdest du gerne das Mentoring (wieder) aufnehmen? Leider konnte ich dich telefonisch nicht erreichen.

Wenn du lieber per WhatsApp kontaktiert werden möchtest, gib mir nur kurz Bescheid. Ich freue mich schon sehr auf dich.

{{MENTOR_NAME}}', 5);
