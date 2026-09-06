export const TUITION_INVOICE = {
  fileName: "tuition-invoice.pdf",
  title: "2026학년도 2학기 등록금",
  amount: 4850000,
  dueDate: "2026.09.11",
  dDay: "D-5",
  recipient: "한양대학교",
  virtualAccount: "1002-•••-4471",
  riskChecks: [
    { id: "match-school", label: "학교 공시 계좌와 일치" },
    { id: "not-personal", label: "개인 명의 계좌 아님" },
    { id: "not-reported", label: "신고된 사기 계좌 목록에 없음" },
  ],
};

export const SCANNING_STEPS = [
  { id: "issuer", label: "발급 기관 확인 · 한양대학교" },
  { id: "extract", label: "금액·기한 추출" },
  { id: "account", label: "입금 계좌 대조 중" },
  { id: "fraud", label: "사기 위험 신호 점검" },
];
