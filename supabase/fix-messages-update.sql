-- Migration: Messages-UPDATE Policy für markChatAsRead
-- Ohne diese Policy schlägt supabase.update({read_at}) lautlos fehl →
-- Ungelesene-Badge wird nie zurückgesetzt.
-- Führe dieses SQL im Supabase Dashboard → SQL Editor aus

DROP POLICY IF EXISTS "messages_update" ON messages;

CREATE POLICY "messages_update" ON messages FOR UPDATE USING (
  -- Mentorship-Teilnehmer dürfen read_at setzen (als gelesen markieren)
  mentorship_id IN (
    SELECT id FROM mentorships WHERE mentor_id = auth.uid() OR mentee_id = auth.uid()
  )
  -- Admin/Office darf alle Nachrichten aktualisieren
  OR get_user_role() IN ('admin', 'office')
);
