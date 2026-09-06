import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAppState } from "@/lib/server/state";
import { getEnrollmentNotice } from "@/lib/crawler/notice";

export type AccountCheckVerdict = "ok" | "mismatch" | "unknown";

export interface TuitionAccountCheck {
  /** 고지서의 입금 은행이 학교가 공지한 은행과 같은지. */
  bank: AccountCheckVerdict;
  /** 학교가 공지한 은행. 공지를 못 읽었으면 null. */
  publishedBank: string | null;
  /** 예금주가 학교 명의로 보이는지. */
  holder: AccountCheckVerdict;
  /** 고지서에서 읽은 예금주. 못 읽었으면 null. */
  invoiceHolder: string | null;
}

/**
 * 고지서의 가상계좌를 학교 공지와 대조한다.
 *
 * 이 검증이 이 화면의 값어치다. 유학생은 학교가 어느 은행으로 가상계좌를
 * 내주는지 모르고, 위조 고지서는 바로 그 자리에 사기 계좌를 넣는다.
 * 우리는 학교 공지를 이미 읽고 있으므로(lib/crawler) 대조할 수 있다.
 *
 * 확인하지 못하는 경우를 "통과"로 뭉개지 않는다. 공지를 못 읽는 학교거나
 * 고지서에서 은행명을 못 읽었으면 unknown이고, 화면은 그때 사용자에게
 * 직접 대조하라고 말한다 — 하지 않은 검증을 했다고 하면, 정작 진짜 위조가
 * 왔을 때도 이 화면을 믿게 된다.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { virtualAccountBank, accountHolder } = await request.json();
  const invoiceBank = typeof virtualAccountBank === "string" ? virtualAccountBank.trim() : "";
  const invoiceHolder = typeof accountHolder === "string" ? accountHolder.trim() : "";

  const { state } = await fetchAppState();
  if (!state) return NextResponse.json({ error: "no profile" }, { status: 400 });

  let publishedBank: string | null = null;
  try {
    const result = await getEnrollmentNotice(state.profile.school);
    publishedBank = result?.notice.terms.virtualAccountBank?.trim() || null;
  } catch {
    // 공지를 못 읽어도 화면은 계속 간다. 그 항목만 unknown이 된다.
  }

  const check: TuitionAccountCheck = {
    bank: compareBank(invoiceBank, publishedBank),
    publishedBank,
    holder: compareHolder(invoiceHolder, state.profile.school),
    invoiceHolder: invoiceHolder || null,
  };

  return NextResponse.json({ check });
}

/**
 * 은행명 대조.
 *
 * 표기가 흔들린다 — "하나은행", "(주)하나은행", "KEB하나은행"이 모두 같은
 * 은행이다. 그래서 완전 일치가 아니라 한쪽이 다른 쪽을 품고 있는지를 본다.
 * "은행"과 공백은 떼어 내고 비교한다.
 */
function compareBank(invoice: string, published: string | null): AccountCheckVerdict {
  if (!invoice || !published) return "unknown";
  const a = normalizeBank(invoice);
  const b = normalizeBank(published);
  if (!a || !b) return "unknown";
  return a.includes(b) || b.includes(a) ? "ok" : "mismatch";
}

function normalizeBank(value: string): string {
  return value.replace(/\s|\(주\)|주식회사|은행|bank/gi, "").toLowerCase();
}

/**
 * 예금주 대조.
 *
 * 등록금 가상계좌의 예금주는 학교 명의이거나 "학교명(학생이름)" 형태다.
 * 개인 이름만 적혀 있으면 위조 신호다 — 이 한 가지가 유학생을 노린 등록금
 * 사기에서 가장 흔한 형태다.
 *
 * 학교 이름은 사용자 언어가 아니라 한국어로 대조한다. 고지서가 한국어로
 * 오기 때문이다.
 */
function compareHolder(holder: string, school: string): AccountCheckVerdict {
  if (!holder) return "unknown";

  const KOREAN_NAME: Record<string, string[]> = {
    hanyang: ["한양"],
    korea: ["고려"],
    ewha: ["이화"],
    snu: ["서울대"],
    yonsei: ["연세"],
    skk: ["성균관"],
  };
  const names = KOREAN_NAME[school];
  if (!names) return "unknown";

  return names.some((name) => holder.includes(name)) ? "ok" : "mismatch";
}
