-- Funktion die anonym aufgerufen werden kann um Duplikate zu prüfen
-- Gibt true zurück wenn E-Mail oder Telefon bereits existiert
CREATE OR REPLACE FUNCTION check_duplicate_registration(
  check_email TEXT,
  check_phone TEXT DEFAULT ''
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  email_exists BOOLEAN := FALSE;
  phone_exists BOOLEAN := FALSE;
BEGIN
  -- E-Mail prüfen
  SELECT EXISTS(SELECT 1 FROM profiles WHERE email = check_email) INTO email_exists;

  -- Telefon prüfen (nur wenn nicht leer)
  IF check_phone IS NOT NULL AND check_phone != '' THEN
    SELECT EXISTS(SELECT 1 FROM profiles WHERE phone = check_phone AND phone != '') INTO phone_exists;
  END IF;

  result := json_build_object(
    'email_exists', email_exists,
    'phone_exists', phone_exists,
    'is_duplicate', email_exists OR phone_exists
  );

  RETURN result;
END;
$$;

-- SECURITY: Nur authentifizierte User dürfen Duplikate prüfen (verhindert E-Mail-Enumeration)
GRANT EXECUTE ON FUNCTION check_duplicate_registration TO authenticated;
