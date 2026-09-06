export const CONTRACT_TYPES = ["월세", "전세", "고시원"];

export const LEASE_CONTRACT = {
  fileName: "lease-2026.pdf",
  pages: 3,
  address: "성동구 마조로 12, 3층",
  deposit: 5000000,
  rent: 620000,
  rentDay: "매월 1일",
  period: "2026.10.01 - 2027.09.30",
};

export const REGISTRY_CHECKS = [
  {
    id: "owner-match",
    label: "등기부상 소유자와 임대인 일치",
    detail: "김OO · 단독 소유",
    status: "done" as const,
  },
  {
    id: "account-owner",
    label: "입금 계좌가 임대인 본인 명의",
    detail: "부동산·제3자 계좌 아님",
    status: "done" as const,
  },
  {
    id: "lien",
    label: "근저당 1억 8천만 원이 설정되어 있습니다",
    detail:
      "집이 경매로 넘어가면 보증금을 돌려받기 어려울 수 있습니다. 확정일자와 전입신고를 계약 당일 처리하세요.",
    status: "warning" as const,
  },
];

export const PROTECTION_STEPS = [
  {
    title: "전입신고 + 확정일자",
    hint: "당일",
    description: "주민센터 또는 정부24 · 수수료 600원",
    location: "성동구 왕십리도선동 주민센터 · 640m",
  },
  {
    title: "전세보증금 반환보증 가입",
    hint: "선택",
    description: "보증료 연 약 25,000원 · 외국인도 가입 가능",
  },
  {
    title: "보증금은 임대인 계좌로만",
    hint: "필수",
    description: "Finmate 한도는 검증된 계좌 1건에만 열립니다",
  },
];

export const CENTER_PHRASE = "전입신고와 확정일자를 함께 받으러 왔습니다.";
