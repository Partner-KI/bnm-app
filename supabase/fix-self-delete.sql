-- ============================================================
-- deactivate_own_account: Mentoren/Mentees können eigenen Account deaktivieren.
-- KEINE Löschung! Profil wird deaktiviert, Name bekommt Zusatz,
-- Auth wird gesperrt → User kann sich nicht mehr einloggen.
-- Alle Daten (Mentorships, Messages, Sessions) bleiben erhalten.
-- Admin kann den Account bei Bedarf wieder entsperren.
--
-- Dieses Statement in Supabase SQL-Editor ausführen.
-- ============================================================

-- Alte Funktion entfernen falls vorhanden
DROP FUNCTION IF EXISTS delete_own_account();

CREATE OR REPLACE FUNCTION deactivate_own_account()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
  current_name TEXT;
  my_id UUID := auth.uid();
BEGIN
  -- Rolle prüfen: nur Mentor/Mentee dürfen sich selbst deaktivieren
  SELECT role, name INTO caller_role, current_name FROM profiles WHERE id = my_id;
  IF caller_role IS NULL OR caller_role NOT IN ('mentor', 'mentee') THEN
    RETURN FALSE;
  END IF;

  -- 1. Profil deaktivieren + Name mit Zusatz markieren
  --    (nur wenn nicht schon deaktiviert)
  UPDATE profiles SET
    is_active  = FALSE,
    name       = CASE
                   WHEN current_name LIKE '%[deaktiviert]' THEN current_name
                   ELSE current_name || ' [deaktiviert]'
                 END,
    avatar_url = NULL
  WHERE id = my_id;

  -- 2. Aktive/Pending Mentorships auf 'cancelled' setzen
  UPDATE mentorships SET
    status = 'cancelled'
  WHERE (mentor_id = my_id OR mentee_id = my_id)
    AND status IN ('active', 'pending');

  -- 3. Auth-User sperren → Login nicht mehr möglich
  UPDATE auth.users
  SET banned_until = '9999-12-31 23:59:59+00'::TIMESTAMPTZ
  WHERE id = my_id;

  RETURN TRUE;
END;
$$;

-- Berechtigungen
REVOKE ALL ON FUNCTION deactivate_own_account() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION deactivate_own_account() TO authenticated;
