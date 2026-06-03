-- Polski Leraar — push_log tabel
-- Logt elke push-notificatiepoging vanuit de Edge Function.
-- Plak dit in: Supabase dashboard → SQL Editor → New query → Run

create table if not exists push_log (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users(id) on delete cascade not null,
  sent_at  timestamptz default now(),
  status   text not null,   -- 'success' | 'failed' | 'skipped' | 'invalid_subscription'
  error    text,
  endpoint text             -- eerste 120 tekens van push-endpoint (voor diagnose)
);

alter table push_log enable row level security;

-- Gebruiker kan eigen logs lezen; schrijven gebeurt via Edge Function met service_role
create policy "Users can read own push logs"
  on push_log for select
  using (auth.uid() = user_id);
