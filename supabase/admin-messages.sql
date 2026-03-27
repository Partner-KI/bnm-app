-- Admin-Messages: Direkte Nachrichten zwischen Admin/Office und Usern
-- Unabhaengig von Mentorships (kein FK auf mentorships-Tabelle)

CREATE TABLE IF NOT EXISTS admin_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_messages_admin_user ON admin_messages(admin_id, user_id);
CREATE INDEX idx_admin_messages_created ON admin_messages(created_at DESC);

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all admin messages" ON admin_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'office'))
  );

CREATE POLICY "Users can read their own admin messages" ON admin_messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert replies to admin messages" ON admin_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

ALTER TABLE admin_messages REPLICA IDENTITY FULL;
