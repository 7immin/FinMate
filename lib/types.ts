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
