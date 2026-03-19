-- Mentorship-Status um pending_approval erweitern
-- Im Supabase Dashboard unter Database → SQL Editor ausführen

ALTER TYPE mentorship_status ADD VALUE IF NOT EXISTS 'pending_approval';

-- Alternativ falls kein ENUM-Typ genutzt wird (varchar/text):
-- Kein SQL nötig, Supabase akzeptiert beliebige String-Werte bei TEXT-Spalten

-- Index für schnelle Abfragen nach pending_approval (optional, empfohlen):
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);
