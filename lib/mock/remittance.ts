import { NationalityId } from "@/lib/types";

export const COUNTRIES: NationalityId[] = ["VN", "CN", "MN", "NP", "MM", "UZ", "KH"];

export const REASON_IDS = ["tuition", "dorm", "living", "general"] as const;
export type ReasonId = (typeof REASON_IDS)[number];

export const EXCHANGE_RATE_TO_VND = 18.4;

export const RISK_CHECK_IDS = [
  { id: "nameMatch", status: "done" as const },
  { id: "sanction", status: "done" as const },
  { id: "frequency", status: "warning" as const },
];

export interface ProofOption {
  id: "employment" | "homeRemittance" | "scholarship";
  bonus: number;
}

export const PROOF_OPTIONS: ProofOption[] = [
  { id: "employment", bonus: 3000000 },
  { id: "homeRemittance", bonus: 2000000 },
  { id: "scholarship", bonus: 1500000 },
];

export interface RemittanceChannel {
  id: "partner" | "wire";
  fee: number;
  recommended?: boolean;
}

export const CHANNELS: RemittanceChannel[] = [
  { id: "partner", fee: 5000, recommended: true },
  { id: "wire", fee: 15000 },
];
