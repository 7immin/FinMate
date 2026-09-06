import { SupabaseClient } from "@supabase/supabase-js";
import { ChecklistItem, FinancialPassport, PassportLevel, PaymentRecord } from "@/lib/types";

interface PassportRow {
  level: PassportLevel;
  current_limit: number;
  next_level_checklist: ChecklistItem[];
  payment_history: PaymentRecord[];
}

export async function getPassportRow(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("financial_passports")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data as PassportRow;
}

export function toPassportState(row: PassportRow): FinancialPassport {
  return {
    level: row.level,
    currentLimit: row.current_limit,
    nextLevelChecklist: row.next_level_checklist,
    paymentHistory: row.payment_history,
  };
}

export async function savePassportRow(
  supabase: SupabaseClient,
  userId: string,
  row: Partial<{
    level: PassportLevel;
    current_limit: number;
    next_level_checklist: ChecklistItem[];
    payment_history: PaymentRecord[];
  }>
) {
  const { data, error } = await supabase
    .from("financial_passports")
    .update(row)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as PassportRow;
}
