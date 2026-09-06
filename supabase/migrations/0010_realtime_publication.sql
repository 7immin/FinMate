-- 은행 승인은 서비스 롤(admin 클라이언트)이 financial_passports/notifications를
-- 직접 업데이트/삽입하는 방식이라, 학생 화면은 다시 불러오기 전까지 그 변화를
-- 알 길이 없었다. 두 테이블을 supabase_realtime 발행 목록에 추가해, 학생의
-- 브라우저가 자기 행이 바뀌는 순간(postgres_changes)을 직접 구독할 수 있게 한다.
-- RLS의 owner-select 정책이 이미 있어 구독자는 자기 것만 받는다.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'financial_passports'
  ) then
    alter publication supabase_realtime add table public.financial_passports;
  end if;
end $$;
