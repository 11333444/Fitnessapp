-- Store the actual logged value for numeric habits (e.g. hours worked),
-- independent of the manual completed checkbox.

alter table public.habit_logs add column logged_value numeric;
