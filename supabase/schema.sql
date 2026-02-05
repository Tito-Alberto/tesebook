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

create table if not exists public.work_views (
  viewer_id text not null,
  work_id uuid references public.works (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (viewer_id, work_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid references auth.users (id) on delete cascade,
  sender_id uuid references auth.users (id) on delete set null,
  type text not null check (type in ('work', 'topic')),
  work_id uuid references public.works (id) on delete cascade,
  topic_id uuid references public.suggested_topics (id) on delete cascade,
  created_at timestamptz default now(),
  read_at timestamptz
);

create index if not exists notifications_receiver_idx
  on public.notifications (receiver_id, read_at, created_at);

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
alter table public.work_views enable row level security;
alter table public.notifications enable row level security;
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
create or replace function public.increment_work_view(work_id uuid, device_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.work_views (viewer_id, work_id)
    values ('user:' || auth.uid()::text, work_id)
    on conflict do nothing;
  elsif device_id is not null and length(trim(device_id)) > 0 then
    insert into public.work_views (viewer_id, work_id)
    values ('device:' || device_id, work_id)
    on conflict do nothing;
  else
    return;
  end if;

  if found then
    update public.works
    set view_count = coalesce(view_count, 0) + 1
    where id = work_id;
  end if;
end;
$$;

grant execute on function public.increment_work_view(uuid, text) to anon, authenticated;

-- Check if current viewer already viewed a work
create or replace function public.has_work_view(work_id uuid, device_id text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer text;
  exists_view boolean;
begin
  if auth.uid() is not null then
    viewer := 'user:' || auth.uid()::text;
  elsif device_id is not null and length(trim(device_id)) > 0 then
    viewer := 'device:' || device_id;
  else
    return false;
  end if;

  select exists(
    select 1
    from public.work_views wv
    where wv.viewer_id = viewer
      and wv.work_id = work_id
  )
  into exists_view;

  return coalesce(exists_view, false);
end;
$$;

grant execute on function public.has_work_view(uuid, text) to anon, authenticated;

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

-- Work views
create policy "work_views_read_own"
on public.work_views for select
using (viewer_id = ('user:' || auth.uid()::text));

create policy "work_views_insert_public"
on public.work_views for insert
with check (
  viewer_id like 'device:%'
  or viewer_id = ('user:' || auth.uid()::text)
);

-- Notifications
create policy "notifications_read_own"
on public.notifications for select
using (auth.uid() = receiver_id);

create policy "notifications_update_own"
on public.notifications for update
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

-- Notify on new work
create or replace function public.notify_course_on_work()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author_course text;
  course_key text;
begin
  select course into author_course
  from public.profiles
  where id = new.user_id;

  course_key := nullif(trim(new.course), '');
  if course_key is null then
    course_key := nullif(trim(author_course), '');
  end if;
  if course_key is null then
    return new;
  end if;

  insert into public.notifications (receiver_id, sender_id, type, work_id, created_at)
  select p.id, new.user_id, 'work', new.id, now()
  from public.profiles p
  where p.id <> new.user_id
    and p.course is not null
    and length(trim(p.course)) > 0
    and lower(trim(p.course)) = lower(course_key);

  return new;
end;
$$;

drop trigger if exists notify_course_on_work on public.works;
create trigger notify_course_on_work
after insert on public.works
for each row
execute function public.notify_course_on_work();

-- Notify on new suggested topic
create or replace function public.notify_course_on_topic()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  course_key text;
begin
  course_key := nullif(trim(new.course), '');
  if course_key is null then
    return new;
  end if;

  insert into public.notifications (receiver_id, sender_id, type, topic_id, created_at)
  select p.id, new.user_id, 'topic', new.id, now()
  from public.profiles p
  where p.id <> new.user_id
    and p.course is not null
    and length(trim(p.course)) > 0
    and lower(trim(p.course)) = lower(course_key);

  return new;
end;
$$;

drop trigger if exists notify_course_on_topic on public.suggested_topics;
create trigger notify_course_on_topic
after insert on public.suggested_topics
for each row
execute function public.notify_course_on_topic();

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

-- Realtime (opcional, se nao estiver habilitado)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
