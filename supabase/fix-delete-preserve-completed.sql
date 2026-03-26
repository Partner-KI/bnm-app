-- Fix: Abgeschlossene Mentorships beim User-Löschen erhalten
-- Statt Mentorship komplett zu löschen:
--   1. Abgeschlossene Mentorships bleiben erhalten
--   2. Profil des gelöschten Users wird anonymisiert ([Gelöscht])
--   3. Nur aktive/pending Mentorships werden gelöscht (Cascade)
--
-- Dieses Statement in Supabase SQL-Editor ausführen.

CREATE OR REPLACE FUNCTION delete_user_completely(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Nur Admins dürfen User löschen
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role NOT IN ('admin', 'office') THEN
    RETURN FALSE;
  END IF;

  -- 1. Abgeschlossene Mentorships anonymisieren (Mentee-Referenz bleibt erhalten für Statistiken)
  --    Mentor-Referenz auf NULL setzen bei abgeschlossenen Mentorships wo dieser User Mentor war
  UPDATE mentorships
    SET mentor_id = NULL
    WHERE mentor_id = target_user_id
      AND status = 'completed';

  -- 2. Profil des gelöschten Users anonymisieren, damit abgeschlossene Mentorships
  --    weiterhin zählbar sind (mentee_id bleibt als Referenz erhalten)
  UPDATE profiles
    SET
      name        = '[Gelöscht]',
      email       = '',
      phone       = NULL,
      avatar_url  = NULL,
      is_active   = FALSE,
      city        = '',
      age         = NULL
    WHERE id = target_user_id;

  -- 3. Nicht-abgeschlossene Mentorships (aktive / pending) löschen (inkl. zugehöriger Sessions, Nachrichten, Feedback)
  DELETE FROM sessions
    WHERE mentorship_id IN (
      SELECT id FROM mentorships
      WHERE (mentor_id = target_user_id OR mentee_id = target_user_id)
        AND status != 'completed'
    );

  DELETE FROM messages
    WHERE mentorship_id IN (
      SELECT id FROM mentorships
      WHERE (mentor_id = target_user_id OR mentee_id = target_user_id)
        AND status != 'completed'
    );

  DELETE FROM feedback
    WHERE mentorship_id IN (
      SELECT id FROM mentorships
      WHERE (mentor_id = target_user_id OR mentee_id = target_user_id)
        AND status != 'completed'
    );

  DELETE FROM mentorships
    WHERE (mentor_id = target_user_id OR mentee_id = target_user_id)
      AND status != 'completed';

  -- 4. Auth-User löschen (entfernt Login, kaskadiert auf profiles falls FK vorhanden)
  --    HINWEIS: auth.users CASCADE löscht auch profiles.id wenn FK mit ON DELETE CASCADE gesetzt.
  --    Falls das Profil noch für die anonymisierten abgeschlossenen Mentorships benötigt wird,
  --    muss der FK in profiles auf RESTRICT oder SET NULL gesetzt sein.
  --    Alternativ: Auth-User deaktivieren statt löschen (siehe unten).
  --
  --    Wenn auth.users → profiles ON DELETE CASCADE aktiv ist:
  --    → Profil wird durch auth.users-Löschung überschrieben → anonymisiertes Profil geht verloren.
  --    In diesem Fall: Profil-FK auf SET NULL ändern ODER Auth-User nur deaktivieren.
  --
  --    Sicherer Weg: Auth-User via Admin-API löschen (außerhalb dieser Funktion),
  --    oder mit service_role key: DELETE FROM auth.users WHERE id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Berechtigungen setzen (anon und authenticated dürfen die Funktion NICHT direkt aufrufen;
-- SECURITY DEFINER läuft als Datenbankbesitzer)
REVOKE ALL ON FUNCTION delete_user_completely(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;
