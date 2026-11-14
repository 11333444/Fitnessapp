-- Weekly checkable shopping list for the nutrition plan (resets every shopping week, Sat-Fri)

create table public.shopping_list_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  item_key text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date, item_key)
);

create trigger shopping_list_logs_set_updated_at
  before update on public.shopping_list_logs
  for each row execute function public.set_updated_at();

alter table public.shopping_list_logs enable row level security;

create policy "shopping_list_logs: owner all" on public.shopping_list_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "shopping_list_logs: admin select all" on public.shopping_list_logs
  for select using (public.is_admin());

create index shopping_list_logs_user_week_idx on public.shopping_list_logs (user_id, week_start_date);
