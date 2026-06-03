-- Polski Leraar — user_words tabel voor eigen woorden
-- Plak dit in: Supabase dashboard → SQL Editor → New query → Run

create table if not exists user_words (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  local_id   integer not null,           -- lokaal integer ID (>= 10000)
  pl         text not null,
  nl         text not null,
  cat        text not null default 'dagelijks',
  ex_pl      text,
  ex_nl      text,
  diff       int default 1,
  gram       text,
  level      text default 'A1',
  source     text default 'user',
  active     boolean default true,
  type       text default 'word',        -- word | phrase | sentence | pattern
  tags       jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, local_id)
);

alter table user_words enable row level security;

create policy "Users own words"
  on user_words for all
  using (auth.uid() = user_id);
