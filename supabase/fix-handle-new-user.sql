-- Fix: handle_new_user Trigger liest jetzt alle Felder aus raw_user_meta_data
-- Behebt Bug 4 (Alter nicht übernommen) und Bug 1 (Gender immer 'male')
-- Diese Datei in Supabase SQL Editor ausführen

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
    COALESCE(NEW.raw_user_meta_data->>'role', 'mentee')::user_role,
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
