-- Kalender: Events + Teilnehmer
-- Migration #20: 2026-04-13

-- Event-Typen
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('webinar', 'retreat', 'kurs', 'meeting', 'custom')),
  location TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recurrence TEXT DEFAULT NULL CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'biweekly', 'monthly')),
  visible_to TEXT NOT NULL DEFAULT 'all' CHECK (visible_to IN ('all', 'mentors', 'mentees', 'male', 'female')),
  is_active BOOLEAN DEFAULT true,
  google_calendar_event_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Jeder kann aktive Events lesen
CREATE POLICY "Anyone can read active events"
  ON calendar_events FOR SELECT
  USING (is_active = true);

-- Admin kann alles verwalten
CREATE POLICY "Admin can manage events"
  ON calendar_events FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Teilnehmer
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  reminder_minutes INTEGER DEFAULT 60,
  google_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- User kann eigene Teilnahme verwalten
CREATE POLICY "Users can manage own attendance"
  ON event_attendees FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin kann alle Teilnahmen sehen und verwalten
CREATE POLICY "Admin can manage all attendance"
  ON event_attendees FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'office')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'office')));

-- Google Calendar Token in Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_token JSONB DEFAULT NULL;
