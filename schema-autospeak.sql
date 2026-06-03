-- Polski Leraar — auto_speak instelling toevoegen
-- Plak dit in: Supabase dashboard → SQL Editor → New query → Run

alter table user_settings
  add column if not exists auto_speak boolean not null default true;
