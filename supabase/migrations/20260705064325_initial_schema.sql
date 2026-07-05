-- Habit Tracker initial schema
-- Conventions: active_weekdays uses ISO 8601 (1=Monday .. 7=Sunday)

-- =========================================================
-- profiles
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- helper: is the current user an admin? security definer so it can read
-- profiles regardless of the caller's own RLS visibility.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- auto-create a profile row whenever a new auth user is created
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "profiles: self select" on public.profiles
  for select using (id = auth.uid());

create policy "profiles: admin select all" on public.profiles
  for select using (public.is_admin());

create policy "profiles: self update own non-role fields" on public.profiles
  for update using (id = auth.uid());

create policy "profiles: admin manage all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- habits
-- =========================================================
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'boolean' check (type in ('boolean', 'numeric')),
  target_value numeric,
  unit text,
  category text,
  active_weekdays smallint[] not null default '{1,2,3,4,5,6,7}',
  linked_field text check (linked_field in ('note', 'no_limit_journal', 'gratitude_journal')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

alter table public.habits enable row level security;

create policy "habits: owner all" on public.habits
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "habits: admin select all" on public.habits
  for select using (public.is_admin());

-- =========================================================
-- habit_logs
-- =========================================================
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, date)
);

create trigger habit_logs_set_updated_at
  before update on public.habit_logs
  for each row execute function public.set_updated_at();

alter table public.habit_logs enable row level security;

create policy "habit_logs: owner all" on public.habit_logs
  for all using (
    exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid())
  );

create policy "habit_logs: admin select all" on public.habit_logs
  for select using (public.is_admin());

-- =========================================================
-- daily_entries (note / no-limit journal / gratitude journal)
-- =========================================================
create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  note text,
  no_limit_journal text,
  gratitude_journal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create trigger daily_entries_set_updated_at
  before update on public.daily_entries
  for each row execute function public.set_updated_at();

alter table public.daily_entries enable row level security;

create policy "daily_entries: owner all" on public.daily_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "daily_entries: admin select all" on public.daily_entries
  for select using (public.is_admin());

-- =========================================================
-- workouts (multiple per day allowed)
-- =========================================================
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  type text not null check (type in ('rest', 'swimming', 'running', 'cycling', 'strength')),
  created_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

create policy "workouts: owner all" on public.workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "workouts: admin select all" on public.workouts
  for select using (public.is_admin());

-- =========================================================
-- weight_entries (Sunday only)
-- =========================================================
create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  weight numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

alter table public.weight_entries enable row level security;

create policy "weight_entries: owner all" on public.weight_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "weight_entries: admin select all" on public.weight_entries
  for select using (public.is_admin());

-- =========================================================
-- form_checks (Sunday only, photo paths in storage)
-- =========================================================
create table public.form_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

alter table public.form_checks enable row level security;

create policy "form_checks: owner all" on public.form_checks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "form_checks: admin select all" on public.form_checks
  for select using (public.is_admin());

-- =========================================================
-- meal_photos (unlimited per day, optional meal label)
-- =========================================================
create table public.meal_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  photo_path text not null,
  meal_label text check (meal_label in ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamptz not null default now()
);

alter table public.meal_photos enable row level security;

create policy "meal_photos: owner all" on public.meal_photos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "meal_photos: admin select all" on public.meal_photos
  for select using (public.is_admin());

-- =========================================================
-- indexes
-- =========================================================
create index habits_user_id_idx on public.habits (user_id);
create index habit_logs_date_idx on public.habit_logs (date);
create index habit_logs_habit_id_idx on public.habit_logs (habit_id);
create index daily_entries_user_date_idx on public.daily_entries (user_id, date);
create index workouts_user_date_idx on public.workouts (user_id, date);
create index weight_entries_user_idx on public.weight_entries (user_id);
create index form_checks_user_idx on public.form_checks (user_id);
create index meal_photos_user_date_idx on public.meal_photos (user_id, date);

-- =========================================================
-- storage buckets (private, per-user folder = <user_id>/...)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('form-checks', 'form-checks', false),
       ('meal-photos', 'meal-photos', false);

create policy "form-checks: owner rw" on storage.objects
  for all using (
    bucket_id = 'form-checks'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'form-checks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "form-checks: admin select" on storage.objects
  for select using (bucket_id = 'form-checks' and public.is_admin());

create policy "meal-photos: owner rw" on storage.objects
  for all using (
    bucket_id = 'meal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'meal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "meal-photos: admin select" on storage.objects
  for select using (bucket_id = 'meal-photos' and public.is_admin());
