import { SchoolId } from "@/lib/types";

export interface TuitionInvoice {
  fileName: string;
  title: string;
  amount: number;
  dueDate: string;
  recipient: SchoolId;
  virtualAccount: string;
}

export const TUITION_INVOICE: TuitionInvoice = {
  fileName: "tuition-invoice.pdf",
  title: "2026학년도 2학기 등록금",
  amount: 4850000,
  dueDate: "2026.09.11",
  recipient: "hanyang",
  virtualAccount: "1002-•••-4471",
};

export const SCANNING_STEP_IDS = ["issuer", "extract", "account", "fraud"] as const;

export const TUITION_RISK_CHECK_IDS = ["matchSchool", "notPersonal", "notReported"] as const;

/** Derives a "D-N" / "D-DAY" / "D+N" label from a "YYYY.MM.DD" due date string. */
export function computeDDay(dueDate: string): string {
  const [y, m, d] = dueDate.split(".").map(Number);
  if (!y || !m || !d) return "";
  const due = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "D-DAY";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}
