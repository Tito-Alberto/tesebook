-- Core tables
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  course text,
  institution text,
  academic_degree text,
  photo_url text,
  created_at timestamptz default now()
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text,
  topic text,
  course text,
  institution text,
  academic_degree text,
  cover_url text,
  pdf_url text,
  allow_download boolean default true,
  view_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.suggested_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text,
  course text,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  work_id uuid references public.works (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, work_id)
);

create table if not exists public.work_stars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  work_id uuid references public.works (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, work_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users (id) on delete cascade,
  receiver_id uuid references auth.users (id) on delete cascade,
  body text,
  created_at timestamptz default now()
);

create table if not exists public.chat_reads (
  user_id uuid references auth.users (id) on delete cascade,
  other_user_id uuid references auth.users (id) on delete cascade,
  last_read_at timestamptz default now(),
  primary key (user_id, other_user_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.suggested_topics enable row level security;
alter table public.favorites enable row level security;
alter table public.work_stars enable row level security;
alter table public.messages enable row level security;
alter table public.chat_reads enable row level security;

-- Profiles
create policy "profiles_read_public"
on public.profiles for select
using (true);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- Works
create policy "works_read_public"
on public.works for select
using (true);

create policy "works_insert_own"
on public.works for insert
with check (auth.uid() = user_id);

create policy "works_update_own"
on public.works for update
using (auth.uid() = user_id);

create policy "works_delete_own"
on public.works for delete
using (auth.uid() = user_id);

-- Increment work views (security definer)
create or replace function public.increment_work_view(work_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.works
  set view_count = coalesce(view_count, 0) + 1
  where id = work_id;
end;
$$;

grant execute on function public.increment_work_view(uuid) to anon, authenticated;

-- Suggested topics
create policy "topics_read_public"
on public.suggested_topics for select
using (true);

create policy "topics_insert_own"
on public.suggested_topics for insert
with check (auth.uid() = user_id);

-- Favorites
create policy "favorites_read_own"
on public.favorites for select
using (auth.uid() = user_id);

create policy "favorites_insert_own"
on public.favorites for insert
with check (auth.uid() = user_id);

create policy "favorites_delete_own"
on public.favorites for delete
using (auth.uid() = user_id);

-- Work stars
create policy "work_stars_read_public"
on public.work_stars for select
using (true);

create policy "work_stars_insert_own"
on public.work_stars for insert
with check (auth.uid() = user_id);

create policy "work_stars_delete_own"
on public.work_stars for delete
using (auth.uid() = user_id);

-- Messages
create policy "messages_read_participant"
on public.messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "messages_insert_sender"
on public.messages for insert
with check (auth.uid() = sender_id);

-- Chat reads
create policy "chat_reads_select_own"
on public.chat_reads for select
using (auth.uid() = user_id);

create policy "chat_reads_insert_own"
on public.chat_reads for insert
with check (auth.uid() = user_id);

create policy "chat_reads_update_own"
on public.chat_reads for update
using (auth.uid() = user_id);

-- Storage buckets (run in SQL editor)
insert into storage.buckets (id, name, public)
values
  ('profile-photos', 'profile-photos', true),
  ('work-covers', 'work-covers', true),
  ('work-pdfs', 'work-pdfs', true)
on conflict (id) do nothing;

-- Storage policies
create policy "storage_read_public"
on storage.objects for select
using (bucket_id in ('profile-photos', 'work-covers', 'work-pdfs'));

create policy "storage_insert_auth"
on storage.objects for insert
with check (bucket_id in ('profile-photos', 'work-covers', 'work-pdfs') and auth.role() = 'authenticated');

create policy "storage_update_auth"
on storage.objects for update
using (bucket_id in ('profile-photos', 'work-covers', 'work-pdfs') and auth.role() = 'authenticated');

create policy "storage_delete_auth"
on storage.objects for delete
using (bucket_id in ('profile-photos', 'work-covers', 'work-pdfs') and auth.role() = 'authenticated');
