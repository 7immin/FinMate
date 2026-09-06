import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppNotification } from "@/lib/types";

interface NotificationRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

function toNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type as AppNotification["type"],
    payload: row.payload,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, payload, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ notifications: (data as NotificationRow[]).map(toNotification) });
}

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
