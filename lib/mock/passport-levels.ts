import { ChecklistItem, PassportLevel } from "@/lib/types";

interface LevelConfig {
  order: number;
  limit: number;
  checklistIds: string[];
}

export const LEVEL_ORDER: PassportLevel[] = ["S1", "S2", "S3", "S4"];

export const LEVEL_CONFIG: Record<PassportLevel, LevelConfig> = {
  S1: {
    order: 1,
    limit: 300000,
    checklistIds: ["passport-verify", "korean-account", "phone-verify"],
  },
  S2: {
    order: 2,
    limit: 600000,
    checklistIds: ["account-active", "first-purpose-tx"],
  },
  S3: {
    order: 3,
    limit: 1000000,
    checklistIds: ["purpose-tx-2", "overdue-clear"],
  },
  S4: {
    order: 4,
    limit: 2000000,
    checklistIds: [],
  },
};

export function nextLevel(level: PassportLevel): PassportLevel | null {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx >= 0 && idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
}

export function cloneChecklist(level: PassportLevel): ChecklistItem[] {
  return LEVEL_CONFIG[level].checklistIds.map((id) => ({ id, done: false }));
}
