-- RLS Policy: Eigene Nachrichten löschen
-- Ausführen im Supabase SQL Editor

-- Policy erstellen (falls noch nicht vorhanden)
CREATE POLICY "messages_delete_own" ON messages FOR DELETE
USING (sender_id = auth.uid());

-- Hinweis: Falls die Policy bereits existiert, zuerst droppen:
-- DROP POLICY IF EXISTS "messages_delete_own" ON messages;
-- Dann obige CREATE POLICY erneut ausführen.

-- Prüfen ob RLS aktiv ist (sollte bereits aktiv sein):
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
