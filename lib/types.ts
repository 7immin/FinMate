export type PassportLevel = "S1" | "S2" | "S3" | "S4";

export type Language = "ko" | "en" | "zh" | "vi";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  hint?: string;
}

export interface UserProfile {
  name: string;
  nationality: string;
  nationalityCode: string;
  visaStatus: string;
  school: string;
  arrivalLabel: string;
  language: Language;
}

export interface PaymentRecord {
  month: string;
  onTime: boolean;
}

export interface FinancialPassport {
  level: PassportLevel;
  currentLimit: number;
  badgeLabel: string;
  nextLevelChecklist: ChecklistItem[];
  paymentHistory: PaymentRecord[];
}

export interface DocumentFlags {
  hasPassport: "yes" | "no" | "unknown";
  hasAlienRegistration: "yes" | "no" | "unknown";
  hasKoreanPhone: "yes" | "no" | "unknown";
}

export interface AppState {
  onboarded: boolean;
  profile: UserProfile;
  passport: FinancialPassport;
  documents: DocumentFlags;
}
