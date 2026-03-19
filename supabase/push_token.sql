-- Push Token Spalte zur profiles-Tabelle hinzufügen
-- Im Supabase Dashboard SQL Editor ausführen

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT DEFAULT NULL;
