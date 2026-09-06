import { SupabaseClient } from "@supabase/supabase-js";
import {
  ChecklistItem,
  FinancialPassport,
  PassportLevel,
  PaymentRecord,
  PurposeCategory,
} from "@/lib/types";
import { LEVEL_CONFIG, cloneChecklist, nextLevel } from "@/lib/mock/passport-levels";

export interface PassportRow {
  level: PassportLevel;
  current_limit: number;
  next_level_checklist: ChecklistItem[];
  payment_history: PaymentRecord[];
  purpose_counts: Partial<Record<PurposeCategory, number>>;
  verification_code: string;
  account_linked_at: string | null;
}

type PassportPatch = Partial<{
  level: PassportLevel;
  current_limit: number;
  next_level_checklist: ChecklistItem[];
  payment_history: PaymentRecord[];
  purpose_counts: Partial<Record<PurposeCategory, number>>;
  account_linked_at: string | null;
}>;

const ACCOUNT_ACTIVE_DAYS = 30;

/**
 * Given a checklist array that's already been updated (an item marked done,
 * or toggled), checks whether every item is now done and, if so, advances
 * the level (resetting to a fresh checklist for the next one). Shared by
 * every path that can change a checklist -- manual toggle, document
 * verification, and the time-based auto-check below -- so level-up logic
 * only lives in one place.
 */
export function applyChecklistPatch(row: PassportRow, checklist: ChecklistItem[]): PassportPatch {
  const allDone = checklist.length > 0 && checklist.every((item) => item.done);
  if (!allDone) {
    return { next_level_checklist: checklist };
  }
  const upgraded = nextLevel(row.level);
  if (!upgraded) {
    return { next_level_checklist: checklist };
  }
  const config = LEVEL_CONFIG[upgraded];
  return {
    level: upgraded,
    current_limit: config.limit,
    next_level_checklist: cloneChecklist(upgraded),
  };
}

function markDone(row: PassportRow, itemId: string): PassportPatch {
  const checklist = row.next_level_checklist.map((item) =>
    item.id === itemId ? { ...item, done: true } : item
  );
  return applyChecklistPatch(row, checklist);
}

/**
 * "한국 계좌 실사용 1개월" isn't something a user can tap to finish -- it's
 * true once 30 real days have passed since the account was linked. Every
 * time we read the passport row, check whether that's now the case and, if
 * so, complete it (and cascade a level-up) the same way any other item
 * would. This makes the check self-healing on read instead of needing a
 * background job.
 */
export async function autoAdvanceAccountActive(
  supabase: SupabaseClient,
  userId: string,
  row: PassportRow
): Promise<PassportRow> {
  if (row.level !== "S2" || !row.account_linked_at) return row;
  const item = row.next_level_checklist.find((i) => i.id === "account-active");
  if (!item || item.done) return row;

  const daysSince = (Date.now() - new Date(row.account_linked_at).getTime()) / 86400000;
  if (daysSince < ACCOUNT_ACTIVE_DAYS) return row;

  const patch = markDone(row, "account-active");
  return savePassportRow(supabase, userId, patch);
}

export async function getPassportRow(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("financial_passports")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return autoAdvanceAccountActive(supabase, userId, data as PassportRow);
}

export function toPassportState(row: PassportRow): FinancialPassport {
  return {
    level: row.level,
    currentLimit: row.current_limit,
    nextLevelChecklist: row.next_level_checklist,
    paymentHistory: row.payment_history,
    purposeCounts: row.purpose_counts ?? {},
    verificationCode: row.verification_code,
    accountLinkedAt: row.account_linked_at,
  };
}

export async function savePassportRow(supabase: SupabaseClient, userId: string, row: PassportPatch) {
  const { data, error } = await supabase
    .from("financial_passports")
    .update(row)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as PassportRow;
}

/**
 * Completes a checklist item that a user just proved with a real document
 * (passport copy, bankbook, payment receipt) or a real transaction --
 * anything that isn't a plain manual toggle. Records account_linked_at the
 * first time "korean-account" completes, since that's what account-active's
 * 30-day check reads later.
 */
export async function completeChecklistItem(
  supabase: SupabaseClient,
  userId: string,
  row: Awaited<ReturnType<typeof getPassportRow>>,
  itemId: string
) {
  const patch = markDone(row, itemId);
  if (itemId === "korean-account" && !row.account_linked_at) {
    patch.account_linked_at = new Date().toISOString();
  }
  return savePassportRow(supabase, userId, patch);
}

/**
 * The one item still completed by a plain manual tap (see
 * app/api/passport/checklist/route.ts) -- a boolean flip rather than a
 * one-way "mark done", so it needs its own entry point into the shared
 * cascade check.
 */
export function toggleChecklistItem(row: PassportRow, itemId: string): PassportPatch {
  const checklist = row.next_level_checklist.map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item
  );
  return applyChecklistPatch(row, checklist);
}
