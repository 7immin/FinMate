import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBankAccessCodeValid, isBankConsoleConfigured } from "@/lib/supabase/admin";
import { PassportLevel, PurposeCategory } from "@/lib/types";

export interface BankReportRow {
  name: string;
  visa_status: string;
  nationality_code: string;
  school: string;
  level: PassportLevel;
  on_time_count: number;
  total_count: number;
  purpose_counts: Partial<Record<PurposeCategory, number>>;
  period_start: string | null;
  period_end: string | null;
}

/**
 * 검증코드로 금융여권 리포트를 조회한다.
 *
 * 이 앱의 로그인은 요구하지 않는다. 창구 직원에게는 이 앱의 계정이 없기
 * 때문이다. 대신 창구 화면과 같은 접근 코드를 요구한다.
 *
 * 나가는 것은 등급과 확인된 사실뿐이다 — 상세 점수와 거래 내역은
 * get_report_by_code가 애초에 돌려주지 않는다. 형식이 맞지 않는 요청은
 * DB까지 보내지 않고 여기서 끊는다.
 */
export async function POST(request: Request) {
  // 창구 화면이 접근 코드로 잠겨 있으므로 이 라우트도 같은 문턱을 쓴다.
  // 공개로 두면 코드만 아는 사람이 아니라 누구나 조회를 시도할 수 있다.
  if (!isBankConsoleConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!isBankAccessCodeValid(request.headers.get("x-bank-access-code"))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { code } = await request.json();

  if (typeof code !== "string" || !/^[A-Za-z0-9-]{4,32}$/.test(code.trim())) {
    return NextResponse.json({ error: "invalid code" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_report_by_code", {
    p_code: code.trim().toUpperCase(),
  });

  if (error) {
    console.error("Bank verify error:", error);
    return NextResponse.json({ error: "lookup_error" }, { status: 502 });
  }

  const report = (data as BankReportRow[] | null)?.[0];
  if (!report) return NextResponse.json({ found: false });

  return NextResponse.json({ found: true, report });
}
