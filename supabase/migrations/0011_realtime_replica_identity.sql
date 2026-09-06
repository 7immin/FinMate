-- 0010에서 supabase_realtime 발행 목록에 두 테이블을 추가한 뒤에도 구독은
-- 성공하는데("Subscribed to PostgreSQL") user_id로 필터링한 UPDATE/INSERT
-- 이벤트가 실제로는 오지 않는 문제가 남아 있었다. Realtime이 필터 컬럼을
-- 안정적으로 매칭하려면 테이블의 REPLICA IDENTITY가 FULL이어야 한다 --
-- 기본값(DEFAULT)은 그 필터 매칭에 필요한 이전 행 정보를 WAL에 충분히
-- 남기지 않는다.
alter table public.notifications replica identity full;
alter table public.financial_passports replica identity full;
