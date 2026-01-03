-- Supabase schema for Tesebook

-- Profiles linked to Supabase Auth
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  photo_url text,
  course text,
  institution text,
  academic_degree text,
  created_at timestamptz default now()
);
create index if not exists idx_profiles_institution on profiles(institution);

-- Works
create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  topic text,
  course text,
  institution text,
  academic_degree text,
  cover_url text,
  pdf_url text,
  allow_download boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_works_user on works(user_id);

-- Suggested topics
create table if not exists suggested_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course text,
  description text,
  created_at timestamptz not null default now()
);

-- Favorites
create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id uuid not null references works(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, work_id)
);
create index if not exists idx_fav_work on favorites(work_id);

-- Views
create table if not exists views (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  work_id uuid not null references works(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_views_work on views(work_id);

-- Likes
create table if not exists likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id uuid not null references works(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, work_id)
);
create index if not exists idx_likes_work on likes(work_id);

-- Chats
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references auth.users(id) on delete cascade,
  user_b_id uuid not null references auth.users(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_a_id, user_b_id)
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists idx_messages_chat on messages(chat_id);

-- RLS policies
alter table profiles enable row level security;
create policy if not exists "owner can read profile" on profiles for select using (auth.uid() = id);
create policy if not exists "owner can upsert profile" on profiles for insert with check (auth.uid() = id);
create policy if not exists "owner can update profile" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

alter table works enable row level security;
create policy if not exists "anyone can read works" on works for select using (true);
create policy if not exists "owner can write works" on works
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table suggested_topics enable row level security;
create policy if not exists "anyone reads topics" on suggested_topics for select using (true);
create policy if not exists "owner writes topics" on suggested_topics
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table favorites enable row level security;
create policy if not exists "owner writes favorites" on favorites
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table views enable row level security;
create policy if not exists "anyone logs views" on views for insert with check (true);
create policy if not exists "anyone reads views" on views for select using (true);

alter table likes enable row level security;
create policy if not exists "owner writes likes" on likes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table chats enable row level security;
create policy if not exists "participants read chats" on chats for select using (
  auth.uid() in (user_a_id, user_b_id)
);
create policy if not exists "participants write chats" on chats
  for all using (auth.uid() in (user_a_id, user_b_id))
  with check (auth.uid() in (user_a_id, user_b_id));

alter table messages enable row level security;
create policy if not exists "participants read messages" on messages for select using (
  exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a_id, c.user_b_id))
);
create policy if not exists "sender writes messages" on messages
  for all using (
    exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a_id, c.user_b_id))
  )
  with check (auth.uid() = sender_id);
