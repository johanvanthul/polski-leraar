-- Polski Leraar — Web Push schema uitbreiding
-- Plak dit in: Supabase dashboard → SQL Editor → New query → Run

-- 1. Push subscription opslaan in user_settings
alter table user_settings
  add column if not exists push_subscription text;

-- 2. pg_cron instellen: roep Edge Function elk uur aan (op het hele uur)
-- Vereist: pg_cron extension (standaard actief in Supabase)
-- Vereist: pg_net extension (voor HTTP-aanroepen vanuit SQL)

select cron.schedule(
  'send-push-reminders',
  '0 * * * *',   -- elk uur op het hele uur
  $$
  select net.http_post(
    url     := 'https://elcrpgsiyiehxjoerkiu.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsY3JwZ3NpeWllaHhqb2Vya2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjI4NzksImV4cCI6MjA5NDIzODg3OX0.bLlEDZFDC15ih3mfkJzq6ToSVmxUNyFXlSOCGgf1Gd8',
      'Content-Type', 'application/json'
    ),
    body    := '{}'::jsonb
  );
  $$
);
