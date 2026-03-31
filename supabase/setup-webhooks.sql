-- ============================================================
-- BNM Push-Webhooks als PostgreSQL-Trigger
-- Ausgeführt automatisch via deploy-push.ps1
-- ============================================================

-- Alten Trigger entfernen falls vorhanden
DROP TRIGGER IF EXISTS push_on_new_message ON public.messages;
DROP TRIGGER IF EXISTS push_on_new_admin_message ON public.admin_messages;

-- Webhook Trigger für Chat-Nachrichten
CREATE TRIGGER push_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://cufuikcxliwbmyhwlmga.supabase.co/functions/v1/send-push',
    'POST',
    '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZnVpa2N4bGl3Ym15aHdsbWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTE1MDksImV4cCI6MjA4OTgyNzUwOX0.MMZ_5cT8Uluz4lWSFC3RSZT0NWmRVwPZIbRelXwAdko"}',
    '{}',
    '5000'
  );

-- Webhook Trigger für Admin-Nachrichten
CREATE TRIGGER push_on_new_admin_message
  AFTER INSERT ON public.admin_messages
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://cufuikcxliwbmyhwlmga.supabase.co/functions/v1/send-push',
    'POST',
    '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZnVpa2N4bGl3Ym15aHdsbWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTE1MDksImV4cCI6MjA4OTgyNzUwOX0.MMZ_5cT8Uluz4lWSFC3RSZT0NWmRVwPZIbRelXwAdko"}',
    '{}',
    '5000'
  );

-- Prüfung: Trigger auflisten
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('push_on_new_message', 'push_on_new_admin_message');
