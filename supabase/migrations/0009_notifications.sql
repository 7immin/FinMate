-- 한도 요청이 승인됐을 때 학생에게 남기는 알림.
--
-- 지금 이 앱이 학생에게 "무슨 일이 있었는지" 알려주는 유일한 방법은
-- 다시 앱을 열어 금융여권을 확인하는 것뿐이다. 승인은 학생이 모르는
-- 사이에(은행 담당자 화면에서) 일어나므로, 여기 한 줄 남겨 두지 않으면
-- 한도가 언제 열렸는지 알 길이 없다.
--
-- 실제 푸시 발송(브라우저 알림)은 하지 않는다 -- 앱 안에서 확인하는
-- 알림함이다. 다음에 앱을 열었을 때 벨 아이콘에 배지로 보인다.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- 학생은 자기 알림만 보고 읽음 처리할 수 있다. 만드는 것은 은행 담당자
-- 화면(서비스 롤, RLS 우회)뿐이다 -- 학생이 스스로 알림을 만들 수 있게
-- 두면 "승인됐어요"를 직접 지어낼 수 있게 된다.
create policy "notifications: owner select" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications: owner update" on public.notifications
  for update using (auth.uid() = user_id);
