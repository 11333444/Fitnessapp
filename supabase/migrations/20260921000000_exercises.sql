-- Exercises & exercise logs for strength training progress tracking

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

alter table public.exercises enable row level security;

create policy "exercises: owner all" on public.exercises
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "exercises: admin select all" on public.exercises
  for select using (public.is_admin());

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  date date not null,
  weight numeric not null,
  reps int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exercise_id, date)
);

create trigger exercise_logs_set_updated_at
  before update on public.exercise_logs
  for each row execute function public.set_updated_at();

alter table public.exercise_logs enable row level security;

create policy "exercise_logs: owner all" on public.exercise_logs
  for all using (
    exists (select 1 from public.exercises e where e.id = exercise_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.exercises e where e.id = exercise_id and e.user_id = auth.uid())
  );

create policy "exercise_logs: admin select all" on public.exercise_logs
  for select using (public.is_admin());

create index exercises_user_id_idx on public.exercises (user_id);
create index exercise_logs_exercise_id_idx on public.exercise_logs (exercise_id);
create index exercise_logs_date_idx on public.exercise_logs (date);
