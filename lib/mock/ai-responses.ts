import { GraduationCap, Briefcase, HandCoins, Send, Landmark } from "lucide-react";

export interface AnswerOption {
  icon: typeof GraduationCap;
  title: string;
  badge?: string;
  amountLine?: string;
  detail: string;
}

export interface AiAnswer {
  reminder?: string;
  options: AnswerOption[];
  warning?: string;
  ctaLabel: string;
  ctaHref: string;
}

const TUITION_SHORTAGE: AiAnswer = {
  reminder: "납부 기한 9월 11일까지 5일 남았습니다",
  options: [
    {
      icon: GraduationCap,
      title: "등록금 납부",
      badge: "가장 빠름",
      amountLine: "1차 · 9/11  2,425,000        2차 · 10/15  2,425,000",
      detail: "추가 이자 없음 · 학교 포털에서 바로 신청",
    },
    {
      icon: Briefcase,
      title: "교내 근로 (시간제 취업)",
      badge: "월 최대 60만",
      detail: "허가 심사 2주 · 주 25시간까지 · 근로계약서는 송금 한도 증빙으로도 쓰입니다",
    },
    {
      icon: HandCoins,
      title: "긴급 장학금",
      badge: "9/8 마감",
      detail: "한양대학교 국제처 · 최대 200만 원 · 성적 3.0 이상",
    },
  ],
  warning: "사설 대출 광고는 안내하지 않습니다. 유학생 대상 고금리 사기가 많습니다.",
  ctaLabel: "등록금 한도 열기",
  ctaHref: "/tuition",
};

const REMITTANCE_PROOF: AiAnswer = {
  options: [
    {
      icon: Briefcase,
      title: "근로 계약서 · 급여 명세",
      amountLine: "+3,000,000원",
      detail: "교내 근로·시간제 취업 허가 포함",
    },
    {
      icon: Landmark,
      title: "본국 송금 내역 (부모 지원)",
      amountLine: "+2,000,000원",
      detail: "최근 3개월 입금 내역이면 충분합니다",
    },
    {
      icon: GraduationCap,
      title: "장학금 수여 증명",
      amountLine: "+1,500,000원",
      detail: "한양대학교 발급 서류",
    },
  ],
  warning: "셋 중 하나만 있으면 그만큼 송금 한도가 열립니다.",
  ctaLabel: "송금 이어서 하기",
  ctaHref: "/remittance",
};

const GENERIC: AiAnswer = {
  options: [
    {
      icon: Send,
      title: "관련 메뉴로 이동하기",
      detail: "질문 내용에 맞는 화면으로 바로 연결해 드릴게요.",
    },
  ],
  ctaLabel: "홈으로 돌아가기",
  ctaHref: "/home",
};

export function getAiAnswer(question: string): AiAnswer {
  const q = question.toLowerCase();
  if (q.includes("학비") || q.includes("등록금") || q.includes("돈이 부족")) return TUITION_SHORTAGE;
  if (q.includes("해외송금") || q.includes("한도를 열려면") || q.includes("뭘 내야")) return REMITTANCE_PROOF;
  return GENERIC;
}

export const SUGGESTED_QUESTIONS = [
  "학비 낼 돈이 부족한데 어떻게 하죠?",
  "재학증명서 어디서 받나요?",
  "해외송금 한도를 열려면 뭘 내야 하나요?",
];
