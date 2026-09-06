import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 내가 올린 한도 요청.
 *
 * RLS가 자기 행만 내주므로 여기서 user_id로 다시 거르지 않아도 남의 것이
 * 섞이지 않는다. 송금 화면이 "이번 달에 몇 번 요청했는지"를 세는 데 쓴다 —
 * 예전에는 그 숫자가 "3회째"로 박혀 있어, 처음 쓰는 사람에게도 세 번째라고
 * 말했다.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("limit_requests")
    .select("id, purpose, amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Limit requests list error:", error);
    return NextResponse.json({ error: "list_error" }, { status: 502 });
  }

  return NextResponse.json({ requests: data ?? [] });
}
