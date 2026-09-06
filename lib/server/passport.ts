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
}

type PassportPatch = Partial<{
  level: PassportLevel;
  current_limit: number;
  next_level_checklist: ChecklistItem[];
  payment_history: PaymentRecord[];
  purpose_counts: Partial<Record<PurposeCategory, number>>;
}>;

/**
 * 서류 업로드로 확인하는 항목. /api/passport/verify가 Gemini OCR로 실제
 * 내용을 읽어야만 완료 처리한다 -- 눌러서 바로 켤 수 없다.
 */
const DOCUMENT_VERIFIED_ITEMS = new Set(["passport-verify"]);

/**
 * 클릭해서 표시하는 항목.
 *
 * 나머지는 사실에서 자동으로 판정된다 — 연체가 없으면 "연체 정리"는 이미
 * 끝난 것이고, 은행이 승인한 목적 거래가 두 건이면 "목적 거래 2회"도
 * 이미 끝난 것이다. 그런 항목까지 눌러서 켤 수 있게 두면 등급이 사실이
 * 아니라 자기 신고가 되고, 그러면 은행에 내미는 금융여권이 아무것도
 * 보증하지 못한다. phone-verify, korean-account, account-active는
 * 예외로 남아 있다 -- 실제 SMS 인증, 계좌 실사용 조회 모두 유료 API나
 * 은행 제휴가 있어야 붙일 수 있어 아직은 버튼으로 대신한다.
 */
const MANUAL_CHECKLIST_ITEMS = new Set(["phone-verify", "korean-account", "account-active"]);

export function isManualChecklistItem(id: string): boolean {
  return MANUAL_CHECKLIST_ITEMS.has(id);
}

export function isDocumentVerifiedItem(id: string): boolean {
  return DOCUMENT_VERIFIED_ITEMS.has(id);
}

/**
 * 저장된 체크리스트 위에 "사실로 판정되는 항목"을 덮어쓴다.
 *
 * 저장된 값을 고치지 않고 읽을 때마다 다시 계산하는 이유: 연체가 새로
 * 생기거나 승인이 취소되면 그 항목은 다시 미완료로 돌아가야 한다. 한 번
 * 저장해 버리면 사실과 어긋난 채로 남는다.
 */
export function deriveChecklist(row: PassportRow): ChecklistItem[] {
  const latePayments = row.payment_history.filter((record) => !record.onTime).length;
  const approvedPurposeTx = Object.values(row.purpose_counts ?? {}).reduce<number>(
    (sum, count) => sum + (count ?? 0),
    0
  );

  return row.next_level_checklist.map((item) => {
    if (item.id === "overdue-clear") return { ...item, done: latePayments === 0 };
    if (item.id === "first-purpose-tx") return { ...item, done: approvedPurposeTx >= 1 };
    if (item.id === "purpose-tx-2") return { ...item, done: approvedPurposeTx >= 2 };
    return item;
  });
}

export function toPassportState(row: PassportRow): FinancialPassport {
  return {
    level: row.level,
    currentLimit: row.current_limit,
    nextLevelChecklist: deriveChecklist(row),
    paymentHistory: row.payment_history,
    purposeCounts: row.purpose_counts ?? {},
    verificationCode: row.verification_code,
  };
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

/**
 * 체크리스트가 다 찼으면 등급을 올린다.
 *
 * 클릭(수동 항목)으로도, 서류 확인으로도, 은행 승인(자동 항목)으로도 다
 * 찰 수 있으므로 모든 경로가 같은 함수를 쓴다. 각자 판단하게 두면 한쪽만
 * 고쳤을 때 같은 조건에서 등급이 오르기도 하고 안 오르기도 한다.
 */
export async function applyLevelUpIfComplete(
  supabase: SupabaseClient,
  userId: string,
  row: PassportRow
): Promise<PassportRow> {
  const checklist = deriveChecklist(row);
  const allDone = checklist.length > 0 && checklist.every((item) => item.done);
  if (!allDone) return row;

  const upgraded = nextLevel(row.level);
  if (!upgraded) return row;

  const config = LEVEL_CONFIG[upgraded];
  return savePassportRow(supabase, userId, {
    level: upgraded,
    // 등급의 기본 한도가 지금 한도보다 낮을 수 있다. 목적 증빙으로 이미
    // 그 이상을 열어 둔 경우인데, 등급이 올랐다고 한도를 깎으면 안 된다.
    current_limit: Math.max(row.current_limit, config.limit),
    next_level_checklist: cloneChecklist(upgraded),
  });
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
 * 서류 업로드로 확인한 항목을 완료 처리한다 (/api/passport/verify).
 */
export async function completeDocumentVerifiedItem(
  supabase: SupabaseClient,
  userId: string,
  row: PassportRow,
  itemId: string
): Promise<PassportRow> {
  const checklist = row.next_level_checklist.map((item) =>
    item.id === itemId ? { ...item, done: true } : item
  );
  const saved = await savePassportRow(supabase, userId, { next_level_checklist: checklist });
  return applyLevelUpIfComplete(supabase, userId, saved);
}

/**
 * 아직 실제 인증을 붙이지 못한 항목(phone-verify, korean-account,
 * account-active)의 수동 토글.
 */
export async function toggleManualChecklistItem(
  supabase: SupabaseClient,
  userId: string,
  row: PassportRow,
  itemId: string
): Promise<PassportRow> {
  const checklist = row.next_level_checklist.map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item
  );
  const saved = await savePassportRow(supabase, userId, { next_level_checklist: checklist });
  return applyLevelUpIfComplete(supabase, userId, saved);
}
