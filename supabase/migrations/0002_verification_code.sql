-- Adds a stable, unique verification code per user (used by the public
-- /verify/[code] page) and a security-definer function that lets anyone
-- (no login required) look up the public, non-sensitive subset of a report
-- by that code -- this is what a bank teller's scanned QR resolves to.

alter table public.financial_passports
  add column if not exists verification_code text;

update public.financial_passports
set verification_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
where verification_code is null;

alter table public.financial_passports
  alter column verification_code set not null,
  alter column verification_code set default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'financial_passports_verification_code_key'
  ) then
    alter table public.financial_passports
      add constraint financial_passports_verification_code_key unique (verification_code);
  end if;
end $$;

create or replace function public.get_report_by_code(p_code text)
returns table (
  name text,
  visa_status text,
  nationality_code text,
  school text,
  level text,
  on_time_count int,
  total_count int,
  purpose_counts jsonb,
  period_start text,
  period_end text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    p.name,
    p.visa_status,
    p.nationality_code,
    p.school,
    fp.level,
    (select count(*)::int from jsonb_array_elements(fp.payment_history) e where (e->>'onTime')::boolean),
    jsonb_array_length(fp.payment_history),
    fp.purpose_counts,
    (fp.payment_history->0->>'month'),
    (fp.payment_history->(jsonb_array_length(fp.payment_history) - 1)->>'month')
  from public.financial_passports fp
  join public.profiles p on p.user_id = fp.user_id
  where fp.verification_code = upper(p_code);
end;
$$;

grant execute on function public.get_report_by_code(text) to anon, authenticated;
