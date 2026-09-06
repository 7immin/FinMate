export const CONTRACT_TYPE_IDS = ["monthly", "jeonse", "goshiwon"] as const;
export type ContractTypeId = (typeof CONTRACT_TYPE_IDS)[number];

export interface LeaseContract {
  fileName: string;
  address: string;
  deposit: number;
  rent: number;
  rentDay: string;
  period: string;
}

export const LEASE_CONTRACT: LeaseContract = {
  fileName: "lease-2026.pdf",
  address: "성동구 마조로 12, 3층",
  deposit: 5000000,
  rent: 620000,
  rentDay: "매월 1일",
  period: "2026.10.01 - 2027.09.30",
};

export const REGISTRY_CHECK_IDS = [
  { id: "ownerMatch", status: "done" as const },
  { id: "accountOwner", status: "done" as const },
  { id: "lien", status: "warning" as const },
];

export const PROTECTION_STEP_LOCATION = "성동구 왕십리도선동 주민센터 · 640m";
