export type PassportLevel = "S1" | "S2" | "S3" | "S4";

export type PurposeCategory = "tuition" | "deposit" | "remittance" | "account";

export type Language = "ko" | "en" | "zh" | "vi";

export interface ChecklistItem {
  id: string;
  done: boolean;
}

export type NationalityId =
  | "vietnam"
  | "china"
  | "mongolia"
  | "nepal"
  | "myanmar"
  | "uzbekistan"
  | "cambodia";

export type SchoolId = "hanyang" | "snu" | "yonsei" | "korea" | "skk";

export interface NotificationSettings {
  paymentDue: boolean;
  passportLevel: boolean;
  marketing: boolean;
}

export interface UserProfile {
  name: string;
  nationality: NationalityId;
  nationalityCode: string;
  visaStatus: string;
  school: SchoolId;
  arrivalLabel: string;
  language: Language;
  notificationSettings: NotificationSettings;
}

export type SupportInquiryCategory = "bug" | "usage" | "other";
export type SupportInquiryStatus = "received" | "answered";

export interface SupportInquiry {
  id: string;
  category: SupportInquiryCategory;
  message: string;
  status: SupportInquiryStatus;
  createdAt: string;
}

export interface PaymentRecord {
  month: string;
  onTime: boolean;
}

export interface FinancialPassport {
  level: PassportLevel;
  currentLimit: number;
  nextLevelChecklist: ChecklistItem[];
  paymentHistory: PaymentRecord[];
  purposeCounts: Partial<Record<PurposeCategory, number>>;
  verificationCode: string;
}

export interface DocumentFlags {
  hasPassport: "yes" | "no" | "unknown";
  hasAlienRegistration: "yes" | "no" | "unknown";
  hasKoreanPhone: "yes" | "no" | "unknown";
}

export interface AppState {
  profile: UserProfile;
  passport: FinancialPassport;
  documents: DocumentFlags;
}

/* ── 사기 진단 ──────────────────────────────────────────────────────── */

export type ThreatRisk = "critical" | "high" | "caution" | "safe";

export type ThreatType =
  | "account_rental" // 통장·체크카드 양도 유인
  | "cash_courier" // 현금 수거책 알바
  | "unregistered_remittance" // 무등록 환전(환치기)
  | "impersonation" // 수사기관·기관 사칭
  | "investment_fraud" // 원금 보장 고수익
  | "phishing_link" // 악성 링크·앱 설치 유도
  | "none";

export interface ThreatScanResult {
  risk: ThreatRisk;
  types: ThreatType[];
  /** 원문에 실제로 등장한 위험 구절. 원문 언어 그대로다. */
  highlights: string[];
  explanation: string;
  consequences: string[];
  actions: string[];
}
