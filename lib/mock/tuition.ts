import { SchoolId } from "@/lib/types";

export interface TuitionInvoice {
  fileName: string;
  title: string;
  amount: number;
  dueDate: string;
  /**
   * 프로필에 등록된 학교. 고지서를 못 읽었을 때의 대비책이다.
   * 실제로 화면에 쓰는 것은 institutionName이 있으면 그쪽이다.
   */
  recipient: SchoolId;
  /**
   * 고지서에서 읽어 낸 발급 기관 이름.
   *
   * 프로필 학교를 그대로 보여주면, 한양대 고지서를 올렸는데 프로필이
   * 고려대라는 이유로 "고려대학교"라고 뜬다. 돈이 어디로 가는지를
   * 우리가 지어내는 셈이라 가장 하면 안 되는 종류의 오류다.
   */
  institutionName: string | null;
  virtualAccount: string;
}

export const TUITION_INVOICE: TuitionInvoice = {
  fileName: "tuition-invoice.pdf",
  title: "2026학년도 2학기 등록금",
  amount: 4850000,
  dueDate: "2026.09.11",
  recipient: "hanyang",
  institutionName: null,
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
