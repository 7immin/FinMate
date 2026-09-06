import { NextResponse } from "next/server";
import { createAdminClient, isBankAccessCodeValid, isBankConsoleConfigured } from "@/lib/supabase/admin";
import {
  applyLevelUpIfComplete,
  getPassportRow,
  savePassportRow,
} from "@/lib/server/passport";
import { PurposeCategory } from "@/lib/types";

/**
 * 서명 URL 유효기간.
 *
 * 창구에서 한 건을 검토하는 동안이면 충분하고, 그 뒤에는 링크가 죽어야
 * 한다. 길게 잡으면 브라우저 기록이나 복사된 주소로 남의 근로계약서가
 * 계속 열린다.
 */
const EVIDENCE_URL_TTL_SECONDS = 300;

export interface LimitRequestRow {
  id: string;
  user_id: string;
  purpose: string;
  amount: number;
  evidence: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
  evidence_path: string | null;
}

/** 담당자가 보는 한 줄. 학생 이름과 등급을 함께 붙여야 판단이 된다. */
export interface BankRequestView extends LimitRequestRow {
  studentName: string;
  visaStatus: string;
  school: string;
  level: string;
  currentLimit: number;
  /** 서류를 열 수 있는 임시 주소. 올라온 파일이 없으면 null. */
  evidenceUrl: string | null;
}

/**
 * 한도 요청 목록.
 *
 * 접근 코드를 헤더로 받는다. 쿼리스트링에 넣으면 서버 로그와 브라우저
 * 기록에 코드가 그대로 남는다.
 */
export async function GET(request: Request) {
  if (!isBankConsoleConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!isBankAccessCodeValid(request.headers.get("x-bank-access-code"))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { data, error } = await admin
    .from("limit_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Bank requests list error:", error);
    return NextResponse.json({ error: "list_error" }, { status: 502 });
  }

  const rows = (data ?? []) as LimitRequestRow[];
  const userIds = [...new Set(rows.map((row) => row.user_id))];

  // 이름·등급은 다른 테이블에 있다. 요청 건마다 조회하면 N번 왕복하므로
  // 한 번에 받아 메모리에서 붙인다.
  const [{ data: profiles }, { data: passports }] = await Promise.all([
    admin.from("profiles").select("user_id, name, visa_status, school").in("user_id", userIds),
    admin.from("financial_passports").select("user_id, level, current_limit").in("user_id", userIds),
  ]);

  const profileBy = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  const passportBy = new Map((passports ?? []).map((p) => [p.user_id, p]));

  // 서류는 비공개 버킷에 있다. 담당자에게는 이 앱의 계정이 없으므로
  // 서비스 롤로 짧은 유효기간의 서명 URL을 만들어 넘긴다. 영구 주소를
  // 주면 그 링크가 어디로든 돌아다닐 수 있다.
  const signedUrls = new Map<string, string>();
  const paths = rows.map((row) => row.evidence_path).filter((p): p is string => Boolean(p));
  if (paths.length > 0) {
    const { data: signed } = await admin.storage
      .from("limit-evidence")
      .createSignedUrls(paths, EVIDENCE_URL_TTL_SECONDS);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) signedUrls.set(item.path, item.signedUrl);
    }
  }

  const requests: BankRequestView[] = rows.map((row) => ({
    ...row,
    studentName: profileBy.get(row.user_id)?.name ?? "-",
    visaStatus: profileBy.get(row.user_id)?.visa_status ?? "-",
    school: profileBy.get(row.user_id)?.school ?? "-",
    level: passportBy.get(row.user_id)?.level ?? "-",
    currentLimit: passportBy.get(row.user_id)?.current_limit ?? 0,
    evidenceUrl: row.evidence_path ? (signedUrls.get(row.evidence_path) ?? null) : null,
  }));

  return NextResponse.json({ requests });
}

/**
 * 승인 / 거절.
 *
 * 한도가 실제로 올라가는 것은 승인하는 이 순간뿐이다. 학생 앱은 요청까지만
 * 하고 한도를 건드리지 않는다 — 화면에서만 열리고 은행에서는 막혀 있으면,
 * 사용자는 창구에 가서야 그 사실을 안다.
 *
 * 거절은 아무것도 바꾸지 않는다. 애초에 열린 적이 없기 때문이다.
 */
export async function POST(request: Request) {
  if (!isBankConsoleConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!isBankAccessCodeValid(request.headers.get("x-bank-access-code"))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id, decision } = await request.json();
  if (typeof id !== "string" || (decision !== "approved" && decision !== "rejected")) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  // 이미 처리된 건은 다시 처리하지 않는다. 승인을 두 번 누르면 한도가
  // 두 번 올라간다.
  const { data: existing, error: findError } = await admin
    .from("limit_requests")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle<LimitRequestRow>();

  if (findError) {
    console.error("Bank decide lookup error:", findError);
    return NextResponse.json({ error: "decide_error" }, { status: 502 });
  }
  if (!existing) return NextResponse.json({ error: "already_decided" }, { status: 409 });

  if (decision === "approved") {
    const row = await getPassportRow(admin, existing.user_id);
    const now = new Date();
    const month = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

    // 승인은 세 가지를 한꺼번에 일으킨다: 한도가 열리고, 목적 거래 한 건이
    // 쌓이고, 그 결과로 등급 조건이 채워지면 등급이 오른다. 예전에는 학생이
    // 흐름을 끝내는 순간 스스로 기록했는데, 그러면 은행이 거절한 건까지
    // 실적으로 남는다.
    const purposeCounts = { ...(row.purpose_counts ?? {}) };
    const purpose = existing.purpose as PurposeCategory;
    purposeCounts[purpose] = (purposeCounts[purpose] ?? 0) + 1;

    const saved = await savePassportRow(admin, existing.user_id, {
      current_limit: row.current_limit + existing.amount,
      purpose_counts: purposeCounts,
      payment_history: [...row.payment_history, { month, onTime: true }],
    });
    await applyLevelUpIfComplete(admin, existing.user_id, saved);
  }

  const { error } = await admin
    .from("limit_requests")
    .update({ status: decision, decided_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Bank decide error:", error);
    return NextResponse.json({ error: "decide_error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
