-- ============================================================
-- E-Mail Queue Tabelle für BNM-App
-- ============================================================
-- Mails werden hier gesammelt und können manuell oder per
-- Edge Function (siehe resend-function.sql) verarbeitet werden.
-- ============================================================

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  override_to TEXT,        -- Temporär: alle Mails an diese Adresse umleiten
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Jeder authentifizierte User kann Mails in die Queue legen
DROP POLICY IF EXISTS "email_queue_insert" ON email_queue;
CREATE POLICY "email_queue_insert" ON email_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Nur Admin/Office kann Queue lesen
DROP POLICY IF EXISTS "email_queue_select" ON email_queue;
CREATE POLICY "email_queue_select" ON email_queue
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'office')
  );

-- Nur Admin/Office kann Status aktualisieren (z.B. als "sent" markieren)
DROP POLICY IF EXISTS "email_queue_update" ON email_queue;
CREATE POLICY "email_queue_update" ON email_queue
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'office')
  );
