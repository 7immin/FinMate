export const COUNTRIES = ["베트남", "중국", "몽골", "네팔", "미얀마", "우즈베키스탄", "캄보디아"];
export const REASONS = ["학비", "기숙사비", "생활비", "일반 송금"];

export const EXCHANGE_RATE_TO_VND = 18.4;

export const RISK_CHECKS = [
  { id: "name-match", label: "수취인 이름이 여권 표기와 일치", status: "done" as const },
  { id: "sanction", label: "제재 대상 목록에 없음", status: "done" as const },
  {
    id: "frequency",
    label: "이 달 생활비 송금이 3회째입니다. 은행에서 자금 출처를 물을 수 있어요.",
    status: "warning" as const,
  },
];

export interface ProofOption {
  id: string;
  label: string;
  description: string;
  bonus: number;
}

export const PROOF_OPTIONS: ProofOption[] = [
  {
    id: "employment",
    label: "근로 계약서 · 급여 명세",
    description: "교내 근로·시간제 취업 허가 포함",
    bonus: 3000000,
  },
  {
    id: "home-remittance",
    label: "본국 송금 내역 (부모 지원)",
    description: "최근 3개월 입금 내역이면 충분합니다",
    bonus: 2000000,
  },
  {
    id: "scholarship",
    label: "장학금 수여 증명",
    description: "한양대학교 발급 서류",
    bonus: 1500000,
  },
];

export interface RemittanceChannel {
  id: string;
  label: string;
  fee: number;
  speed: string;
  recommended?: boolean;
}

export const CHANNELS: RemittanceChannel[] = [
  {
    id: "partner",
    label: "해외송금 전문업체 (제휴)",
    fee: 5000,
    speed: "수 분 이내 도착",
    recommended: true,
  },
  {
    id: "wire",
    label: "은행 전신송금 (SWIFT)",
    fee: 15000,
    speed: "1~2 영업일 소요",
  },
];
