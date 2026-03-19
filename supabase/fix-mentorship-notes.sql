-- Migration: Notizen-Feld für Mentorships (Mentor-private Notizen)
-- Führe dieses SQL im Supabase Dashboard → SQL Editor aus

ALTER TABLE mentorships ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
