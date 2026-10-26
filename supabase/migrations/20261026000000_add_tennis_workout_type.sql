alter table public.workouts drop constraint workouts_type_check;
alter table public.workouts add constraint workouts_type_check
  check (type = any (array['rest', 'swimming', 'running', 'cycling', 'strength', 'tennis']));
