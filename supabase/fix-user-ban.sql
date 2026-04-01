-- ============================================================
-- admin_set_user_banned: Sperrt/entsperrt einen User vollständig.
-- Setzt SOWOHL profiles.is_active ALS AUCH auth.users.banned_until.
-- Läuft als SECURITY DEFINER (DB-Owner) → darf auth.users updaten.
-- ============================================================

CREATE OR REPLACE FUNCTION admin_set_user_banned(
  target_user_id UUID,
  should_ban BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Nur Admin darf sperren
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role NOT IN ('admin', 'office') THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  -- profiles.is_active aktualisieren
  UPDATE profiles SET is_active = NOT should_ban WHERE id = target_user_id;

  -- auth.users.banned_until setzen (Supabase-native Sperre)
  -- NULL = entsperrt, weit in der Zukunft = dauerhaft gesperrt
  UPDATE auth.users
  SET banned_until = CASE
    WHEN should_ban THEN '9999-12-31 23:59:59+00'::TIMESTAMPTZ
    ELSE NULL
  END
  WHERE id = target_user_id;
END;
$$;

-- Nur authentifizierte User können die Funktion aufrufen (RLS greift oben)
GRANT EXECUTE ON FUNCTION admin_set_user_banned(UUID, BOOLEAN) TO authenticated;
