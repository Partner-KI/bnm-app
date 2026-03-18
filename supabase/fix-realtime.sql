-- Realtime für profiles und mentorships aktivieren
-- (messages war bereits aktiviert in migration.sql)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE mentorships;
