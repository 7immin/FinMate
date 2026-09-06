import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getPassportRow,
  isManualChecklistItem,
  toPassportState,
  toggleManualChecklistItem,
} from "@/lib/server/passport";

/**
 * 체크리스트 항목 표시.
 *
 * 수동 항목만 받는다. "연체 정리"나 "목적 거래"처럼 사실에서 판정되는
 * 항목, "여권 실물 확인"/"한국 계좌 1개 연결"처럼 서류로 확인하는 항목은
 * 눌러서 켤 수 없다 — 켤 수 있게 두면 등급이 사실이 아니라 자기 신고가
 * 되고, 은행에 내미는 금융여권이 아무것도 보증하지 못한다.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { itemId } = await request.json();
  if (typeof itemId !== "string" || !isManualChecklistItem(itemId)) {
    return NextResponse.json({ error: "not_manual" }, { status: 400 });
  }

  const row = await getPassportRow(supabase, user.id);
  const updated = await toggleManualChecklistItem(supabase, user.id, row, itemId);

  return NextResponse.json({ passport: toPassportState(updated) });
}
