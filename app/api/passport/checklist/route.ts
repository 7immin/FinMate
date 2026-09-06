import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPassportRow, savePassportRow, toPassportState } from "@/lib/server/passport";
import { LEVEL_CONFIG, cloneChecklist, nextLevel } from "@/lib/mock/passport-levels";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { itemId } = await request.json();
  const row = await getPassportRow(supabase, user.id);

  const checklist = row.next_level_checklist.map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item
  );
  const allDone = checklist.length > 0 && checklist.every((item) => item.done);

  let updated;
  if (!allDone) {
    updated = await savePassportRow(supabase, user.id, { next_level_checklist: checklist });
  } else {
    const upgraded = nextLevel(row.level);
    if (!upgraded) {
      updated = await savePassportRow(supabase, user.id, { next_level_checklist: checklist });
    } else {
      const config = LEVEL_CONFIG[upgraded];
      updated = await savePassportRow(supabase, user.id, {
        level: upgraded,
        current_limit: config.limit,
        next_level_checklist: cloneChecklist(upgraded),
      });
    }
  }

  return NextResponse.json({ passport: toPassportState(updated) });
}
