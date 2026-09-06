import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PurposeCategory } from "@/lib/types";

const PURPOSES: PurposeCategory[] = ["tuition", "deposit", "remittance", "account"];

/**
 * 한도 열기 "요청".
 *
 * 이 앱이 실제로 할 수 있는 일은 여기까지다. 한도를 여는 것은 은행이고,
 * 우리는 증빙과 목적을 정리해 요청으로 올릴 뿐이다. 예전에는 이 라우트가
 * 곧바로 current_limit을 올렸는데, 그러면 화면은 열렸다고 하는데 실제
 * 은행 계좌에서는 여전히 막혀 있어 사용자가 창구에서야 그 사실을 안다.
 *
 * 그래서 여기서는 요청만 남기고 한도는 건드리지 않는다. 은행 담당자가
 * 승인하면 그때 올라간다(/api/bank/requests).
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { amount, purpose, evidence } = await request.json();
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "invalid amount" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("limit_requests")
    .insert({
      user_id: user.id,
      purpose: PURPOSES.includes(purpose) ? purpose : "remittance",
      amount,
      evidence: typeof evidence === "string" ? evidence.slice(0, 200) : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Limit request error:", error);
    return NextResponse.json({ error: "request_error" }, { status: 502 });
  }

  return NextResponse.json({ request: data });
}
