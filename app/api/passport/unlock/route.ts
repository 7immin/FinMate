import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPassportRow, savePassportRow, toPassportState } from "@/lib/server/passport";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { amount } = await request.json();
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "invalid amount" }, { status: 400 });
  }

  const row = await getPassportRow(supabase, user.id);
  const updated = await savePassportRow(supabase, user.id, {
    current_limit: row.current_limit + amount,
  });

  return NextResponse.json({ passport: toPassportState(updated) });
}
