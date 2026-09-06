-- 1:1 support inquiries submitted from More > Contact support.

create table if not exists public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'other',
  message text not null,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

alter table public.support_inquiries enable row level security;

create policy "support_inquiries: owner select" on public.support_inquiries
  for select using (auth.uid() = user_id);
create policy "support_inquiries: owner insert" on public.support_inquiries
  for insert with check (auth.uid() = user_id);
