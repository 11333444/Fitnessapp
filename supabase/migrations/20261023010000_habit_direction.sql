-- Auto-completion for numeric habits: "direction" says whether the
-- logged value must be at least the target (default, e.g. steps,
-- pages, protein) or at most the target (e.g. money spent).

alter table public.habits add column direction text not null default 'at_least'
  check (direction in ('at_least', 'at_most'));
