import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAppState } from "@/lib/server/state";
import { getEnrollmentNotice, isSupported } from "@/lib/crawler/notice";

/**
 * 학교 등록 일정.
 *
 * 학교를 쿼리로 받지 않고 로그인한 사용자의 프로필에서 읽는다. 아무 학교나
 * 넣어 부를 수 있게 두면, 인증은 있으나 마나 한 크롤링 대행 창구가 된다.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { state } = await fetchAppState();
  if (!state) return NextResponse.json({ error: "no profile" }, { status: 400 });

  const schoolId = state.profile.school;
  if (!isSupported(schoolId)) {
    // 어댑터가 없는 학교. 없는 일정을 지어내는 대신 없다고 답한다.
    return NextResponse.json({ supported: false, schoolId });
  }

  try {
    const result = await getEnrollmentNotice(schoolId);
    if (!result) return NextResponse.json({ supported: false, schoolId });
    return NextResponse.json({ supported: true, ...result });
  } catch (err) {
    console.error("Notice fetch error:", err);
    return NextResponse.json({ error: "notice_error" }, { status: 502 });
  }
}
