-- Training variants: tag exercises by muscle group, and let a
-- strength-training workout record which variant was used.

alter table public.exercises add column muscle_group text
  check (muscle_group is null or muscle_group in ('ruecken', 'schulter', 'bauch', 'beine'));

alter table public.workouts add column variant text
  check (variant is null or variant in ('normal', 'no_shoulder_legs', 'no_back_abs'));
