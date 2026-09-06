-- Run this in the Supabase SQL Editor if you already ran the original schema.sql
-- before this column existed. Safe to run multiple times.

alter table public.financial_passports
  add column if not exists purpose_counts jsonb not null default '{}'::jsonb;
