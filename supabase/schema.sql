-- FinMate database schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  nationality text not null,
  nationality_code text not null,
  visa_status text not null,
  school text not null,
  arrival_label text not null,
  language text not null default 'ko',
  notification_settings jsonb not null
    default '{"paymentDue":true,"passportLevel":true,"marketing":false}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_passports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level text not null default 'S1',
  current_limit bigint not null default 300000,
  next_level_checklist jsonb not null default '[]'::jsonb,
  payment_history jsonb not null default '[]'::jsonb,
  purpose_counts jsonb not null default '{}'::jsonb,
  verification_code text not null unique
    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_flags (
  user_id uuid primary key references auth.users(id) on delete cascade,
  has_passport text not null default 'unknown',
  has_alien_registration text not null default 'unknown',
  has_korean_phone text not null default 'unknown',
  updated_at timestamptz not null default now()
);

create table if not exists public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'other',
  message text not null,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.financial_passports enable row level security;
alter table public.document_flags enable row level security;
alter table public.support_inquiries enable row level security;

create policy "profiles: owner select" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles: owner insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = user_id);

create policy "financial_passports: owner select" on public.financial_passports for select using (auth.uid() = user_id);
create policy "financial_passports: owner insert" on public.financial_passports for insert with check (auth.uid() = user_id);
create policy "financial_passports: owner update" on public.financial_passports for update using (auth.uid() = user_id);

create policy "document_flags: owner select" on public.document_flags for select using (auth.uid() = user_id);
create policy "document_flags: owner insert" on public.document_flags for insert with check (auth.uid() = user_id);
create policy "document_flags: owner update" on public.document_flags for update using (auth.uid() = user_id);

create policy "support_inquiries: owner select" on public.support_inquiries for select using (auth.uid() = user_id);
create policy "support_inquiries: owner insert" on public.support_inquiries for insert with check (auth.uid() = user_id);

-- Atomically creates the three rows for a newly onboarded user.
create or replace function public.complete_onboarding(
  p_name text,
  p_nationality text,
  p_nationality_code text,
  p_visa_status text,
  p_school text,
  p_arrival_label text,
  p_language text,
  p_checklist jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, nationality, nationality_code, visa_status, school, arrival_label, language)
  values (auth.uid(), p_name, p_nationality, p_nationality_code, p_visa_status, p_school, p_arrival_label, p_language)
  on conflict (user_id) do update set
    name = excluded.name,
    nationality = excluded.nationality,
    nationality_code = excluded.nationality_code,
    visa_status = excluded.visa_status,
    school = excluded.school,
    arrival_label = excluded.arrival_label,
    language = excluded.language,
    updated_at = now();

  insert into public.financial_passports (user_id, level, current_limit, next_level_checklist, payment_history)
  values (auth.uid(), 'S1', 300000, p_checklist, '[]'::jsonb)
  on conflict (user_id) do nothing;

  insert into public.document_flags (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;
end;
$$;

-- Public, unauthenticated lookup for the "show this QR at the counter" report.
-- Only returns the same non-sensitive summary already shown inside the app --
-- never detailed scores or raw transaction amounts.
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

-- Combines the profile + financial_passport + document_flags lookup that the
-- (app) layout does on every page load into a single round trip.
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
