import { NextResponse } from "next/server";
import { fetchAppState } from "@/lib/server/state";

/**
 * 탭이 다시 보일 때 앱 상태를 다시 불러오는 용도.
 *
 * 은행 승인은 realtime 구독으로 즉시 반영되지만, 구독이 막 연결된
 * 직후에 승인이 지나가면 그 사이의 좁은 틈에서 이벤트를 놓칠 수 있다.
 * 탭을 백그라운드에 두었다가 돌아오는 순간 한 번 더 불러오면, 놓친
 * 이벤트가 있어도 그 순간 메꿔진다.
 */
export async function GET() {
  const { onboarded, state } = await fetchAppState();
  if (!onboarded || !state) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ state });
}
