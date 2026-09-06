import { AppState } from "@/lib/types";

export const initialAppState: AppState = {
  onboarded: false,
  profile: {
    name: "응우옌 티 흐엉",
    nationality: "베트남",
    nationalityCode: "VNM",
    visaStatus: "D-2",
    school: "한양대학교",
    arrivalLabel: "2026년 3월",
    language: "ko",
  },
  passport: {
    level: "S1",
    currentLimit: 300000,
    badgeLabel: "새로 입국",
    nextLevelChecklist: [
      { id: "passport-verify", label: "여권 실물 확인", done: false },
      { id: "korean-account", label: "한국 계좌 1개 연결", done: false },
      { id: "phone-verify", label: "한국 휴대폰 번호 인증", done: false },
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
