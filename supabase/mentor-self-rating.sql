-- Mentor Self-Rating: Mentoren können sich selbst mit 1-5 Sternen bewerten

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS self_rating NUMERIC(2,1) DEFAULT 0;

-- Mentor darf nur sein eigenes self_rating updaten
-- (bestehende RLS-Policy für profiles erlaubt UPDATE where id = auth.uid() bereits)
-- Falls noch keine Policy besteht, hier ergänzen:
-- CREATE POLICY "profiles_self_update" ON profiles
--   FOR UPDATE USING (id = auth.uid());
