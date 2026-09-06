import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyChecklistPatch, getPassportRow, savePassportRow, toPassportState } from "@/lib/server/passport";
import { PurposeCategory } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { category } = (await request.json().catch(() => ({}))) as {
    category?: PurposeCategory;
  };

  const row = await getPassportRow(supabase, user.id);

  const targetIdx = row.next_level_checklist.findIndex((item) => item.id.includes("purpose-tx"));
  const checklist =
    targetIdx === -1
      ? row.next_level_checklist
      : row.next_level_checklist.map((item, idx) =>
          idx === targetIdx ? { ...item, done: true } : item
        );

  const now = new Date();
  const month = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  const purposeCounts = { ...row.purpose_counts };
  if (category) {
    purposeCounts[category] = (purposeCounts[category] ?? 0) + 1;
  }

  // A completed purpose transaction can be the last item needed for a
  // level-up (e.g. "first-purpose-tx" at S2) -- run it through the same
  // cascade check every other completion path uses, instead of only ever
  // saving the checklist as-is.
  const checklistPatch = applyChecklistPatch(row, checklist);

  const updated = await savePassportRow(supabase, user.id, {
    ...checklistPatch,
    payment_history: [...row.payment_history, { month, onTime: true }],
    purpose_counts: purposeCounts,
  });

  return NextResponse.json({ passport: toPassportState(updated) });
}
