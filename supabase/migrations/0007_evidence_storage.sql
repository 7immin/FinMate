-- 증빙 서류 보관.
--
-- 지금은 요청에 파일 "이름"만 남는다(limit_requests.evidence). 그러면 은행
-- 담당자는 "근로계약서.pdf"라는 글자만 보고 승인 여부를 정하게 되고,
-- 아무것도 증명되지 않는다. 파일 자체가 담당자에게 닿아야 승인이 판단이 된다.
--
-- 버킷은 비공개다. 공개로 두면 URL을 아는 사람 누구나 남의 근로계약서와
-- 통장 사본을 열 수 있다. 담당자는 서비스 롤로 서명 URL(짧은 유효기간)을
-- 만들어 열고, 학생은 자기 파일만 읽는다.

-- 1) 요청 행에 파일 경로를 담을 자리
alter table public.limit_requests
  add column if not exists evidence_path text;

-- 2) 비공개 버킷
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'limit-evidence',
  'limit-evidence',
  false,
  10485760, -- 10MB. 여권 사진과 계약서 스캔이면 충분하고, 더 크면 창구에서 열기 느리다.
  array['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- 3) 접근 규칙
--
-- 파일 경로를 "<user_id>/<파일명>"으로 두고, 첫 폴더 이름이 자기 uid인
-- 것만 다루게 한다. 이 규칙 하나로 남의 파일에는 손을 댈 수 없다.

drop policy if exists "limit-evidence: owner insert" on storage.objects;
create policy "limit-evidence: owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'limit-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "limit-evidence: owner select" on storage.objects;
create policy "limit-evidence: owner select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'limit-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 수정과 삭제는 열어 두지 않는다. 낸 증빙을 나중에 바꿔치기할 수 있으면
-- 승인 기록이 무엇을 보고 내린 판단이었는지 알 수 없게 된다.
--
-- 담당자 쪽 읽기 정책은 두지 않는다. 담당자에게는 이 앱의 계정이 없어
-- authenticated 롤이 아니고, 서비스 롤은 애초에 RLS를 우회한다.
