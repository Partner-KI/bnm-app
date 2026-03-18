-- Migration: contact_preference Feld zu mentor_applications hinzufügen
ALTER TABLE mentor_applications ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'whatsapp';
