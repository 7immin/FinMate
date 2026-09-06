-- Adds per-user notification preferences to profiles.
-- get_full_state() already returns to_jsonb(profiles) as-is, so no function
-- change is needed -- the new column appears automatically in profile.notification_settings.

alter table public.profiles
  add column if not exists notification_settings jsonb not null
    default '{"paymentDue":true,"passportLevel":true,"marketing":false}'::jsonb;
