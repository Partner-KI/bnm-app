-- Admin-Notizen für Profile (nur Admin sichtbar)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';
