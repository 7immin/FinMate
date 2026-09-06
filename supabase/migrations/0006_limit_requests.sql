-- 한도 요청.
--
-- 학생이 증빙을 내고 한도를 열면 그 사실이 여기 한 줄로 남는다. 은행
-- 담당자는 이 목록을 보고 승인하거나 거절한다.
--
-- 한도는 요청 즉시 열린다(승인을 기다리지 않는다). 유학생이 등록금 마감
-- 앞에서 막히는 것이 이 서비스가 풀려는 문제인데, 거기에 다시 심사 대기를
-- 얹으면 같은 문제를 되돌려 놓는 꼴이 된다. 대신 거절되면 그때 열렸던
-- 만큼을 되돌린다 — 그래서 승인이 형식이 아니라 실제 판단이 된다.

create table if not exists public.limit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- 무엇에 쓰려고 열었는지. AppState의 PurposeCategory와 같은 값이다.
  purpose text not null,
  amount bigint not null check (amount > 0),
  -- 무엇으로 목적을 증명했는지 (근로계약서, 본국 송금 내역, 장학금 증명 등).
  evidence text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

-- 담당자 화면은 "아직 안 본 것"부터 본다.
create index if not exists limit_requests_pending_idx
  on public.limit_requests (status, created_at desc);

alter table public.limit_requests enable row level security;

-- 학생은 자기 요청만 보고 만들 수 있다. 은행 담당자 화면은 서비스 롤 키로
-- 접근하므로 RLS를 우회한다 — 담당자에게는 이 앱의 계정이 없기 때문이다.
drop policy if exists "limit_requests: owner select" on public.limit_requests;
create policy "limit_requests: owner select" on public.limit_requests
  for select using (auth.uid() = user_id);

drop policy if exists "limit_requests: owner insert" on public.limit_requests;
create policy "limit_requests: owner insert" on public.limit_requests
  for insert with check (auth.uid() = user_id);
