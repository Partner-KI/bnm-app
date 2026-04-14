-- Fix: WITH CHECK für alle UPDATE/INSERT/ALL Policies die es fehlten
-- Ohne WITH CHECK schlagen INSERT/UPDATE-Operationen still fehl
-- (Supabase gibt keinen Fehler, aber die Row wird nicht geschrieben)
-- Migration #21: 2026-04-14 — BEREITS AUF REMOTE AUSGEFÜHRT

-- profiles
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING ((id = auth.uid()) OR (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role])))
  WITH CHECK ((id = auth.uid()) OR (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role])));

-- admin_messages (ALL)
DROP POLICY IF EXISTS "Admin can manage all admin messages" ON admin_messages;
CREATE POLICY "Admin can manage all admin messages" ON admin_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'office')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'office')));

-- admin_messages (UPDATE read_at)
DROP POLICY IF EXISTS "Users can update read_at on their own admin messages" ON admin_messages;
CREATE POLICY "Users can update read_at on their own admin messages" ON admin_messages FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- app_settings
DROP POLICY IF EXISTS "settings_update" ON app_settings;
CREATE POLICY "settings_update" ON app_settings FOR UPDATE
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]))
  WITH CHECK (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]));

-- email_queue
DROP POLICY IF EXISTS "email_queue_update" ON email_queue;
CREATE POLICY "email_queue_update" ON email_queue FOR UPDATE
  USING (true) WITH CHECK (true);

-- hadithe
DROP POLICY IF EXISTS "hadithe_admin" ON hadithe;
CREATE POLICY "hadithe_admin" ON hadithe FOR ALL
  USING (get_user_role() = 'admin'::user_role)
  WITH CHECK (get_user_role() = 'admin'::user_role);

-- mentor_applications
DROP POLICY IF EXISTS "applications_update" ON mentor_applications;
CREATE POLICY "applications_update" ON mentor_applications FOR UPDATE
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]))
  WITH CHECK (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]));

-- mentor_awards
DROP POLICY IF EXISTS "awards_admin_write" ON mentor_awards;
CREATE POLICY "awards_admin_write" ON mentor_awards FOR ALL
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]))
  WITH CHECK (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]));

-- mentorships
DROP POLICY IF EXISTS "mentorships_update" ON mentorships;
CREATE POLICY "mentorships_update" ON mentorships FOR UPDATE
  USING ((get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role, 'mentor'::user_role])))
  WITH CHECK ((get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role, 'mentor'::user_role])));

-- message_templates
DROP POLICY IF EXISTS "templates_admin_update" ON message_templates;
CREATE POLICY "templates_admin_update" ON message_templates FOR UPDATE
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]))
  WITH CHECK (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]));

-- messages
DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages FOR UPDATE
  USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

-- notifications
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- qa_entries
DROP POLICY IF EXISTS "qa_admin" ON qa_entries;
CREATE POLICY "qa_admin" ON qa_entries FOR ALL
  USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]))
  WITH CHECK (get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]));

-- session_types
DROP POLICY IF EXISTS "session_types_admin" ON session_types;
CREATE POLICY "session_types_admin" ON session_types FOR ALL
  USING (get_user_role() = 'admin'::user_role)
  WITH CHECK (get_user_role() = 'admin'::user_role);

-- sessions
DROP POLICY IF EXISTS "sessions_update" ON sessions;
CREATE POLICY "sessions_update" ON sessions FOR UPDATE
  USING (documented_by = auth.uid() OR get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]))
  WITH CHECK (documented_by = auth.uid() OR get_user_role() = ANY (ARRAY['admin'::user_role, 'office'::user_role]));

-- streaks
DROP POLICY IF EXISTS "streaks_upsert" ON streaks;
CREATE POLICY "streaks_upsert" ON streaks FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
