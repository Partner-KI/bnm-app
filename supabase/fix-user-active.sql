-- Migration: is_active Flag für User-Sperrung
-- Führe dieses SQL im Supabase Dashboard → SQL Editor aus

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Alle bestehenden User aktiv setzen
UPDATE profiles SET is_active = true WHERE is_active IS NULL;
