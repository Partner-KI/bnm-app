-- Migration: force_password_change Flag für Profiles
-- Wird gesetzt wenn Admin ein temporäres Passwort vergibt.
-- User wird nach Login zum Passwort-Ändern weitergeleitet.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;
