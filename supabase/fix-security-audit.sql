-- ============================================================
-- SECURITY AUDIT FIXES (2026-04-08)
-- Führe dieses SQL im Supabase Dashboard → SQL Editor aus
-- ============================================================

-- FIX 1: Privilege Escalation in handle_new_user()
-- Rolle wird IMMER auf 'mentee' gesetzt, nie aus Metadaten übernommen.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, gender, city, plz, age, phone, contact_preference)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Neuer Benutzer'),
    'mentee'::user_role,  -- SICHERHEIT: Immer 'mentee', nie aus Metadaten!
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male')::gender_type,
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'plz', ''),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 0),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_preference', 'whatsapp')::contact_preference
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FIX 2: XP INSERT — nur eigene XP oder Admin
DROP POLICY IF EXISTS "xp_insert" ON xp_log;
CREATE POLICY "xp_insert" ON xp_log FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'office')
);

-- FIX 3: Achievements INSERT — nur eigene oder Admin
DROP POLICY IF EXISTS "achievements_insert" ON achievements;
CREATE POLICY "achievements_insert" ON achievements FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'office')
);

-- FIX 4: Mentorship INSERT — nur Admin/Office (kein Self-Assign durch Mentoren)
DROP POLICY IF EXISTS "mentorships_insert" ON mentorships;
CREATE POLICY "mentorships_insert" ON mentorships FOR INSERT WITH CHECK (
  get_user_role() IN ('admin', 'office')
);

-- FIX 5: E-Mail-Enumeration verhindern — anon Grant entfernen (nur wenn Funktion existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_duplicate_registration') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION check_duplicate_registration FROM anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION check_duplicate_registration TO authenticated';
  END IF;
END $$;

-- FIX 6: email_queue INSERT — nur authentifizierte User mit Rate-Limit-Hinweis
DROP POLICY IF EXISTS "email_queue_insert" ON email_queue;
CREATE POLICY "email_queue_insert" ON email_queue FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
