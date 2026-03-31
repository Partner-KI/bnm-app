-- Migration: Fehlende RLS-Policies
-- Ohne diese Policies scheitern folgende Funktionen lautlos:
--   - updateSession / deleteSession (Mentor-Session bearbeiten/löschen)
--   - createNotification (Reminders, Zuweisung, Session-Notifs → NIE eingefügt)
--   - rejectMentorship (ausstehende Zuweisung ablehnen)
--   - updateUser durch Admin (User-Profil-Bearbeitung scheitert)
-- Führe dieses SQL im Supabase Dashboard → SQL Editor aus

-- ─── Sessions: UPDATE + DELETE ────────────────────────────────────────────────

DROP POLICY IF EXISTS "sessions_update" ON sessions;

CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (
  -- Mentor darf eigene Sessions bearbeiten
  documented_by = auth.uid()
  -- Admin/Office darf alle bearbeiten
  OR get_user_role() IN ('admin', 'office')
);

DROP POLICY IF EXISTS "sessions_delete" ON sessions;

CREATE POLICY "sessions_delete" ON sessions FOR DELETE USING (
  -- Mentor darf eigene Sessions löschen
  documented_by = auth.uid()
  -- Admin/Office darf alle löschen
  OR get_user_role() IN ('admin', 'office')
);

-- ─── Notifications: INSERT ────────────────────────────────────────────────────
-- Fehlt komplett → checkReminders, createNotification, addSession-Notifs schlagen alle fehl

DROP POLICY IF EXISTS "notifications_insert" ON notifications;

CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (
  -- Admin/Office kann für alle benachrichtigen
  get_user_role() IN ('admin', 'office')
  -- Jeder User kann sich selbst benachrichtigen (Reminder-System)
  OR user_id = auth.uid()
  -- Mentor kann seinen Mentee benachrichtigen (Session-Notifs, Erinnerungen)
  OR EXISTS (
    SELECT 1 FROM mentorships
    WHERE mentor_id = auth.uid() AND mentee_id = user_id
  )
  -- Mentee kann seinen Mentor benachrichtigen (Danke-Funktion)
  OR EXISTS (
    SELECT 1 FROM mentorships
    WHERE mentee_id = auth.uid() AND mentor_id = user_id
  )
);

-- ─── Mentorships: DELETE ──────────────────────────────────────────────────────
-- rejectMentorship löscht Mentorship direkt

DROP POLICY IF EXISTS "mentorships_delete" ON mentorships;

CREATE POLICY "mentorships_delete" ON mentorships FOR DELETE USING (
  get_user_role() IN ('admin', 'office')
);

-- ─── Profiles: UPDATE für Admin ───────────────────────────────────────────────
-- profiles_update_own erlaubt nur id = auth.uid()
-- Admin kann dadurch keine anderen User-Profile bearbeiten

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  -- User kann eigenes Profil bearbeiten
  id = auth.uid()
  -- Admin/Office kann alle Profile bearbeiten (für updateUser Funktion)
  OR get_user_role() IN ('admin', 'office')
);
