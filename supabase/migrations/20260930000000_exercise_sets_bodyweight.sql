-- Sets per exercise log, and bodyweight-only exercises (no kg tracking)

alter table public.exercises add column is_bodyweight boolean not null default false;

alter table public.exercise_logs alter column weight drop not null;
alter table public.exercise_logs add column sets smallint;
