-- "한국 계좌 실사용 1개월" (account-active) checklist item is time-based, not
-- something a user can just tap to complete. account_linked_at records the
-- moment the "korean-account" item was actually verified, so we can check
-- 30 real days later whether account-active should auto-complete.
--
-- This lives on its own column (not inside next_level_checklist) because the
-- checklist array gets replaced wholesale on every level-up -- an S1
-- timestamp stored only inside the S1 checklist would be lost by the time
-- we reach S2 and need it.

alter table public.financial_passports
  add column if not exists account_linked_at timestamptz;
