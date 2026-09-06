import { ChecklistItem, PassportLevel } from "@/lib/types";

interface LevelConfig {
  order: number;
  limit: number;
  badgeLabel: string;
  nextChecklist: ChecklistItem[];
}

export const LEVEL_ORDER: PassportLevel[] = ["S1", "S2", "S3", "S4"];

export const LEVEL_CONFIG: Record<PassportLevel, LevelConfig> = {
  S1: {
    order: 1,
    limit: 300000,
    badgeLabel: "새로 입국",
    nextChecklist: [
      { id: "passport-verify", label: "여권 실물 확인", done: false },
      { id: "korean-account", label: "한국 계좌 1개 연결", done: false },
      { id: "phone-verify", label: "한국 휴대폰 번호 인증", done: false },
    ],
  },
  S2: {
    order: 2,
    limit: 600000,
    badgeLabel: "기본 인증 완료",
    nextChecklist: [
      { id: "account-active", label: "한국 계좌 실사용 1개월", done: false },
      { id: "first-purpose-tx", label: "목적 거래 1건 완료", done: false },
    ],
  },
  S3: {
    order: 3,
    limit: 1000000,
    badgeLabel: "정상 거래 3개월",
    nextChecklist: [
      {
        id: "purpose-tx-2",
        label: "목적 거래 2건 중 1건 완료",
        done: false,
        hint: "1/2",
      },
      {
        id: "overdue-clear",
        label: "연체 1건 정리하기",
        done: false,
        hint: "6월 공과금",
      },
    ],
  },
  S4: {
    order: 4,
    limit: 2000000,
    badgeLabel: "우수 이용자",
    nextChecklist: [],
  },
};

export function nextLevel(level: PassportLevel): PassportLevel | null {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx >= 0 && idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
}

export function cloneChecklist(level: PassportLevel): ChecklistItem[] {
  return LEVEL_CONFIG[level].nextChecklist.map((item) => ({ ...item }));
}
