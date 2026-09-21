-- Swim training log (Wochenprotokoll) for the Kraul swim plan

create table public.swim_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  unit text not null check (unit in ('tempo', 'ausdauer')),
  stufe smallint not null check (stufe between 1 and 5),
  gefuehl smallint check (gefuehl between 1 and 10),
  notiz text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date, unit)
);

create trigger swim_logs_set_updated_at
  before update on public.swim_logs
  for each row execute function public.set_updated_at();

alter table public.swim_logs enable row level security;

create policy "swim_logs: owner all" on public.swim_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "swim_logs: admin select all" on public.swim_logs
  for select using (public.is_admin());

create index swim_logs_user_date_idx on public.swim_logs (user_id, date);
