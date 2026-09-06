-- 금융여권 화면의 "승인 대기" 줄(pendingRequests)은 financial_passports/
-- notifications와 별도로 관리되는 상태라, 0010/0011에서 그 두 테이블만
-- 실시간으로 구독하게 해서는 승인·거절 뱃지가 바뀌지 않았다. limit_requests
-- 자체의 status가 바뀌는 순간도 학생이 직접 구독할 수 있어야 한다.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'limit_requests'
  ) then
    alter publication supabase_realtime add table public.limit_requests;
  end if;
end $$;

alter table public.limit_requests replica identity full;
