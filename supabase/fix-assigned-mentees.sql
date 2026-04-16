-- RPC-Funktion: Gibt IDs aller Mentees mit aktiver/pending Betreuung zurueck.
-- SECURITY DEFINER umgeht RLS, damit auch Mentoren sehen koennen
-- welche Mentees bereits zugewiesen sind (ohne sensible Daten preiszugeben).

CREATE OR REPLACE FUNCTION get_assigned_mentee_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT mentee_id FROM mentorships
  WHERE status IN ('active', 'pending_approval');
$$;

-- Jeder authentifizierte User darf die Funktion aufrufen
GRANT EXECUTE ON FUNCTION get_assigned_mentee_ids() TO authenticated;
