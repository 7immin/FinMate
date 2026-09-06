import { DocumentFlags } from "@/lib/types";

export interface Branch {
  id: string;
  name: string;
  distance: string;
  tags: string[];
  note: string;
  hours: string;
}

export const BRANCHES: Branch[] = [
  {
    id: "woori-hanyang",
    name: "우리은행 한양대지점",
    distance: "340m",
    tags: ["영어·베트남어", "여권만 가능", "대기 4명"],
    note: "가장 가까움",
    hours: "09:00 - 16:00 · 오늘 방문 가능",
  },
  {
    id: "kb-wangsimni",
    name: "국민은행 왕십리역",
    distance: "1.1km",
    tags: ["영어", "등록증 필요"],
    note: "",
    hours: "09:00 - 16:00",
  },
  {
    id: "shinhan-seongdong",
    name: "신한은행 성동구청",
    distance: "1.6km",
    tags: ["영어·중국어", "예약 필요"],
    note: "",
    hours: "09:00 - 16:00",
  },
];

export interface GuidanceStepItem {
  title: string;
  hint: string;
}

export function buildGuidance(documents: DocumentFlags): {
  aiMessage: string;
  steps: GuidanceStepItem[];
  followUps: string[];
} {
  const hasAlienRegistration = documents.hasAlienRegistration === "yes";

  if (!hasAlienRegistration) {
    return {
      aiMessage:
        "외국인등록증이 아직 없으니 여권만으로 열 수 있는 계좌부터 만드는 게 빠릅니다. 이 계좌는 국내 이체 한도가 낮지만 학비 납부는 가능합니다.",
      steps: [
        { title: "여권 + 재학증명서 준비", hint: "한양대학교 국제처에서 당일 발급" },
        { title: "외국인 전용 창구 방문", hint: "영어 상담 가능한 지점만 골라 드립니다" },
        { title: "등록증 나오면 한도 상향", hint: "보통 3~4주 뒤 · 알림으로 알려드립니다" },
      ],
      followUps: ["재학증명서 어디서 받나요?", "수수료 있나요?"],
    };
  }

  return {
    aiMessage: "외국인등록증이 있으니 첫 방문에 기본 한도로 바로 계좌를 개설할 수 있습니다.",
    steps: [
      { title: "여권 + 외국인등록증 준비", hint: "신분증 원본 지참" },
      { title: "외국인 전용 창구 방문", hint: "영어 상담 가능한 지점만 골라 드립니다" },
      { title: "기본 한도로 즉시 개설", hint: "추가 서류 없이 진행 가능" },
    ],
    followUps: ["필요한 서류가 더 있나요?", "수수료 있나요?"],
  };
}

export const REQUEST_PHRASE = {
  ko: {
    title: "외국인 유학생 계좌 개설 요청",
    body: "여권으로 개설 가능한 유학생 계좌를 만들고 싶습니다. 학비 납부 용도입니다.",
  },
  en: {
    title: "Foreign Student Account Opening Request",
    body: "I would like to open a student account using my passport. It is for tuition payment.",
  },
  vi: {
    title: "Yêu cầu mở tài khoản cho du học sinh nước ngoài",
    body: "Tôi muốn mở tài khoản sinh viên bằng hộ chiếu. Mục đích là để đóng học phí.",
  },
};
