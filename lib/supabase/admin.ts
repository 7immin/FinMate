import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * 서비스 롤 클라이언트. 서버에서만 쓴다.
 *
 * 은행 담당자 화면은 여러 학생의 한도 요청을 한 목록으로 봐야 하는데,
 * 그 담당자에게는 이 앱의 계정이 없다. 계정이 없으니 auth.uid()가 없고,
 * RLS는 자기 행만 보게 되어 있어 그대로는 아무것도 못 읽는다. 그래서
 * 이 경로만 RLS를 우회한다.
 *
 * 이 키는 모든 행을 읽고 쓸 수 있으므로 절대 클라이언트로 나가면 안 된다.
 * NEXT_PUBLIC_ 접두사를 쓰지 않는 것이 그 방벽이고, 이 파일을 import하는
 * 곳은 API 라우트로 한정한다.
 *
 * 키가 없으면 null을 돌려준다 — 화면이 "설정이 필요하다"고 밝히게 하기
 * 위해서다. 없는 키로 조용히 빈 목록을 보여주면, 요청이 없는 것인지
 * 설정이 안 된 것인지 담당자가 구분할 수 없다.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * 창구 담당자용 접근 코드가 맞는지.
 *
 * 검증코드 조회(/api/bank/verify)는 학생이 코드를 건네야만 열리므로 그
 * 자체가 방벽이지만, 요청 목록은 다르다 — 코드 없이 전체가 보인다.
 * 그래서 지점에 공유하는 접근 코드 하나를 요구한다.
 *
 * 이것은 인증이 아니라 문턱이다. 제대로 하려면 담당자 계정과 권한 테이블이
 * 있어야 하는데, 그건 은행과의 제휴가 정해진 뒤에 붙일 일이다. 지금
 * 없는 것을 있는 척하지 않기 위해 이름도 "접근 코드"로 둔다.
 */
export function isBankAccessCodeValid(code: unknown): boolean {
  const expected = process.env.BANK_ACCESS_CODE;
  if (!expected) return false;
  return typeof code === "string" && code.trim() === expected;
}

export function isBankConsoleConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.BANK_ACCESS_CODE);
}
