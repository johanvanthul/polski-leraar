-- Polski Leraar — Supabase schema
-- Plak dit in: Supabase dashboard → SQL Editor → New query → Run

-- 1. Voortgang per woord
create table if not exists user_cards (
  user_id       uuid references auth.users on delete cascade not null,
  word_id       integer not null,
  box           integer not null default 0,
  last_review   bigint  not null default 0,
  reviews       integer not null default 0,
  streak        integer not null default 0,
  misses        integer not null default 0,
  mode_flashcard integer not null default 0,
  mode_type     integer not null default 0,
  added_at      bigint  not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (user_id, word_id)
);
alter table user_cards enable row level security;
create policy "Own cards" on user_cards for all using (auth.uid() = user_id);

-- 2. Statistieken
create table if not exists user_stats (
  user_id            uuid references auth.users on delete cascade primary key,
  streak             integer not null default 0,
  best_streak        integer not null default 0,
  total_reviews      integer not null default 0,
  today_reviews      integer not null default 0,
  today_correct      integer not null default 0,
  last_session_date  bigint,
  sessions_completed integer not null default 0,
  today_date         text,
  words_learned      integer not null default 0
);
alter table user_stats enable row level security;
create policy "Own stats" on user_stats for all using (auth.uid() = user_id);

-- 3. Instellingen
create table if not exists user_settings (
  user_id          uuid references auth.users on delete cascade primary key,
  daily_goal       integer not null default 20,
  session_size     integer not null default 10,
  direction        text    not null default 'mix',
  retry_wrong      boolean not null default true,
  show_grammar     boolean not null default true,
  show_examples    boolean not null default true,
  reminder_enabled boolean not null default false,
  reminder_time    text    not null default '20:00'
);
alter table user_settings enable row level security;
create policy "Own settings" on user_settings for all using (auth.uid() = user_id);
