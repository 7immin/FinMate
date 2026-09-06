-- Combines the profile + financial_passport + document_flags lookup that the
-- (app) layout does on every page load into a single round trip instead of
-- three separate queries (plus this replaces a separate getUser() call --
-- auth.uid() is already available from the request's session).

create or replace function public.get_full_state()
returns table (
  profile jsonb,
  passport jsonb,
  documents jsonb
)
language sql
stable
as $$
  select
    to_jsonb(p) as profile,
    to_jsonb(fp) as passport,
    to_jsonb(df) as documents
  from public.profiles p
  join public.financial_passports fp on fp.user_id = p.user_id
  join public.document_flags df on df.user_id = p.user_id
  where p.user_id = auth.uid();
$$;

grant execute on function public.get_full_state() to authenticated;
