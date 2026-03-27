-- Mentor Awards Tabelle
-- Speichert den Mentor des Monats (monatlich eindeutig via UNIQUE Constraint)

CREATE TABLE IF NOT EXISTS mentor_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  score INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

-- RLS aktivieren
ALTER TABLE mentor_awards ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten User dürfen lesen
CREATE POLICY "awards_read" ON mentor_awards
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Nur Admins dürfen schreiben (INSERT, UPDATE, DELETE)
CREATE POLICY "awards_admin_write" ON mentor_awards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role::TEXT IN ('admin', 'office')
    )
  );

-- Realtime aktivieren
ALTER PUBLICATION supabase_realtime ADD TABLE mentor_awards;
