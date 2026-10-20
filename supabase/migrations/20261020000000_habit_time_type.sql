-- Allow a new habit type "time": target_value/logged_value store
-- minutes-since-midnight, reusing existing numeric columns.

alter table public.habits drop constraint habits_type_check;
alter table public.habits add constraint habits_type_check
  check (type = any (array['boolean', 'numeric', 'time']));
