-- Category 03 Phase 05: retain generator provenance on immutable scramble rows.
-- Existing rows intentionally remain NULL because their provenance is unknown.
alter table public.scrambles
  add column generator_provider text,
  add column generation_method text;

alter table public.scrambles
  add constraint scrambles_generator_provider_check
    check (generator_provider is null or length(btrim(generator_provider)) between 1 and 128),
  add constraint scrambles_generation_method_check
    check (generation_method is null or generation_method in ('RANDOM_STATE', 'RANDOM_MOVE'));
