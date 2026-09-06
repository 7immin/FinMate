import { NextResponse } from "next/server";

/**
 * 원화 기준 환율.
 *
 * 고정값을 코드에 박아 두면 발표 몇 주 뒤부터 틀린 금액을 보여준다.
 * 유학생이 그 금액을 보고 송금 계획을 세우므로 틀리면 그대로 손해다.
 *
 * 브라우저가 아니라 서버에서 부른다. 화면마다 각자 부르면 사용자 수만큼
 * 외부 API를 때리고, 응답 캐시도 각자 따로 갖게 된다.
 */
const SOURCE = "https://open.er-api.com/v6/latest/KRW";

/**
 * 갱신 주기.
 *
 * 이 API 자체가 하루 한 번 갱신하므로 더 자주 불러도 값이 같다. 한 시간이면
 * 충분히 최신이고, 발표 중 수백 명이 눌러도 외부 호출은 시간당 한 번이다.
 */
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(SOURCE, { next: { revalidate } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.result !== "success" || !data.rates) throw new Error("unexpected payload");

    return NextResponse.json({
      base: "KRW",
      rates: data.rates as Record<string, number>,
      updatedAt: data.time_last_update_utc as string,
    });
  } catch (err) {
    // 환율을 못 받으면 금액을 지어내지 않는다. 화면이 "환율 정보 없음"으로
    // 표시하고, 받는 금액 줄 자체를 그리지 않는다.
    console.error("FX fetch failed:", err);
    return NextResponse.json({ error: "fx_unavailable" }, { status: 502 });
  }
}
