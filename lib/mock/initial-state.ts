import { AppState } from "@/lib/types";

export const initialAppState: AppState = {
  onboarded: false,
  profile: {
    name: "응우옌 티 흐엉",
    nationality: "vietnam",
    nationalityCode: "VNM",
    visaStatus: "D-2",
    school: "hanyang",
    arrivalLabel: "2026년 3월",
    language: "ko",
  },
  passport: {
    level: "S1",
    currentLimit: 300000,
    nextLevelChecklist: [
      { id: "passport-verify", done: false },
      { id: "korean-account", done: false },
      { id: "phone-verify", done: false },
    ],
    paymentHistory: [
      { month: "2026.04", onTime: true },
      { month: "2026.05", onTime: true },
      { month: "2026.06", onTime: true },
      { month: "2026.07", onTime: true },
    ],
  },
  documents: {
    hasPassport: "unknown",
    hasAlienRegistration: "unknown",
    hasKoreanPhone: "unknown",
  },
};
