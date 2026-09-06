import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 목록을 열어 본 순간 전부 읽음 처리한다. 어떤 알림 하나를 눌러야만
 * 읽히는 방식은 배지 숫자가 끝없이 남는다 -- 목록을 봤다는 것 자체가
 * "확인했다"는 뜻이다.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
