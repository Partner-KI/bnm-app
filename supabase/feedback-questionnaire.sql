-- ============================================================
-- Feedback-Fragebogen: JSONB-Spalte für strukturierte Antworten
-- Erweitert die einfache Sternebewertung um einen mehrstufigen Fragebogen.
-- Die bestehende 'rating'-Spalte bleibt für Kompatibilität (= Q1.1 Gesamtbewertung).
--
-- Dieses Statement in Supabase SQL-Editor ausführen.
-- ============================================================

ALTER TABLE feedback ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT NULL;
