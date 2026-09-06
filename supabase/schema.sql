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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_passports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level text not null default 'S1',
  current_limit bigint not null default 300000,
  next_level_checklist jsonb not null default '[]'::jsonb,
  payment_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.document_flags (
  user_id uuid primary key references auth.users(id) on delete cascade,
  has_passport text not null default 'unknown',
  has_alien_registration text not null default 'unknown',
  has_korean_phone text not null default 'unknown',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.financial_passports enable row level security;
alter table public.document_flags enable row level security;

create policy "profiles: owner select" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles: owner insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = user_id);

create policy "financial_passports: owner select" on public.financial_passports for select using (auth.uid() = user_id);
create policy "financial_passports: owner insert" on public.financial_passports for insert with check (auth.uid() = user_id);
create policy "financial_passports: owner update" on public.financial_passports for update using (auth.uid() = user_id);

create policy "document_flags: owner select" on public.document_flags for select using (auth.uid() = user_id);
create policy "document_flags: owner insert" on public.document_flags for insert with check (auth.uid() = user_id);
create policy "document_flags: owner update" on public.document_flags for update using (auth.uid() = user_id);

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
