import { SchoolId } from "@/lib/types";

export const TUITION_INVOICE = {
  fileName: "tuition-invoice.pdf",
  title: "2026학년도 2학기 등록금",
  amount: 4850000,
  dueDate: "2026.09.11",
  dDay: "D-5",
  recipient: "hanyang" as SchoolId,
  virtualAccount: "1002-•••-4471",
};

export const SCANNING_STEP_IDS = ["issuer", "extract", "account", "fraud"] as const;

export const TUITION_RISK_CHECK_IDS = ["matchSchool", "notPersonal", "notReported"] as const;
