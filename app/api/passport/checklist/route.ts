import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPassportRow, savePassportRow, toPassportState, toggleChecklistItem } from "@/lib/server/passport";

// Every other checklist item now requires real proof (a verified document,
// an actual purpose transaction, or 30 real days elapsed) -- see
// /api/passport/verify and completeChecklistItem/autoAdvanceAccountActive in
// lib/server/passport.ts. phone-verify is the one item still deferred to a
// plain manual toggle (see conversation: real SMS verification needs a paid
// provider we haven't wired up yet).
const MANUALLY_TOGGLABLE = ["phone-verify"];

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { itemId } = await request.json();
  if (!MANUALLY_TOGGLABLE.includes(itemId)) {
    return NextResponse.json({ error: "not_toggleable" }, { status: 400 });
  }

  const row = await getPassportRow(supabase, user.id);
  const patch = toggleChecklistItem(row, itemId);
  const updated = await savePassportRow(supabase, user.id, patch);

  return NextResponse.json({ passport: toPassportState(updated) });
}
