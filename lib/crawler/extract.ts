import { GoogleGenAI } from "@google/genai";
import { SchoolId } from "@/lib/types";
import { EnrollmentNotice, RawDoc, SourceKind } from "./types";

const MODEL = "gemini-3.1-flash-lite";

/** 원문 구간에 붙이는 라벨. 모델이 어느 쪽 공지인지 알 수 있게 한다. */
const SECTION_LABEL: Record<SourceKind, string> = {
  schedule: "등록일정 공지",
  payment: "납부방법 공지",
  combined: "등록 안내 (일정과 납부방법이 한 페이지에 있음)",
};

/**
 * 네 언어를 함께 받는다.
 *
 * 번역을 추출 단계에서 같이 받는 이유: 결과가 학교당 6시간 캐시되므로
 * 번역 비용이 사실상 한 번이고, 화면에서 언어를 바꿔도 추가 호출이 없다.
 */
const LOCALIZED = {
  type: "object",
  properties: {
    ko: { type: "string" },
    en: { type: "string" },
    zh: { type: "string" },
    vi: { type: "string" },
  },
  required: ["ko", "en", "zh", "vi"],
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    academicYear: { type: "string", description: "예: 2026학년도" },
    semester: { type: "string", description: "예: 2학기" },
    entries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: LOCALIZED,
          kind: {
            type: "string",
            enum: ["regular", "installment", "additional", "excess", "freshman", "other"],
          },
          installmentRound: { type: ["number", "null"] },
          startDate: { type: "string", description: "YYYY-MM-DD" },
          endDate: { type: "string", description: "YYYY-MM-DD" },
          endTime: { type: ["string", "null"], description: "HH:mm 또는 null" },
        },
        required: ["label", "kind", "installmentRound", "startDate", "endDate", "endTime"],
      },
    },
    methods: { type: "array", items: { type: "string" } },
    virtualAccountBank: { type: ["string", "null"] },
    splitTransferAllowed: { type: "boolean" },
    splitTransferNote: {
      anyOf: [LOCALIZED, { type: "null" }],
      description:
        "분할송금 금지의 근거가 된 공지 원문 문장. ko에는 원문을 한 글자도 바꾸지 말고 그대로 옮긴다. 그런 문장이 없으면 null.",
    },
    notes: { type: "array", items: LOCALIZED },
  },
  required: [
    "academicYear",
    "semester",
    "entries",
    "methods",
    "virtualAccountBank",
    "splitTransferAllowed",
    "splitTransferNote",
    "notes",
  ],
};

const SYSTEM = `당신은 한국 대학의 등록금 관련 공지 원문을 읽어 구조화하는 추출기다.

규칙:
- 날짜는 반드시 YYYY-MM-DD로 정규화한다. 학교마다 표기가 달라
  "24(월) - 28(금)", "8. 24.(월)~8. 28.(금)", "2026.08.24.(월) ~ 08.30.(일)"
  같은 형태가 모두 나온다. 연도나 월이 생략됐으면 그 절의 월 제목과 문서
  상단의 학년도에서 추론한다. "2026학년도 2학기"는 보통 그 해 하반기이므로
  월이 1~2월이면 다음 해로 넘어간다.
- kind는 항목명에서 판단한다: "정규 등록"/"본등록"→regular,
  "분할납부 N차"→installment (installmentRound에 N),
  "추가등록"/"추가(최종) 등록"→additional, "초과학기자"/"학업연장"→excess,
  "신입생"→freshman, 그 외→other.
- 재학생이 실제로 등록금을 내는 항목만 entries에 담는다. 고지서 출력 기간,
  분할납부 신청 기간처럼 돈을 내는 날이 아닌 항목은 제외한다.
- splitTransferAllowed와 분할납부 제도를 절대 혼동하지 마라. 둘은 다른 말이다.
  · "분할납부"는 학교가 등록금을 여러 회차로 쪼개 주는 제도다. 이것이 있다고
    해서 splitTransferAllowed가 true가 되는 것이 아니다.
  · "분할송금"은 한 회차 금액을 은행에서 여러 번에 나눠 보내는 것이다.
    "분할송금은 불가", "전액 일괄송금"처럼 명시된 문구가 있으면 false로 둔다.
  · 두 학교 모두 분할납부는 허용하면서 분할송금은 금지한다. 이 조합이 정상이다.
- splitTransferAllowed를 false로 두었으면 splitTransferNote에 그 근거가 된
  원문 문장을 한 글자도 바꾸지 말고 ko에 그대로 옮긴다. 근거 문장을 찾을 수
  없으면 false로 두지 말고 true로 두어라 — 근거 없는 금지는 안내가 아니다.
- notes에는 원문에 있는 제약 문장만 옮긴다. 요약하거나 새로 만들지 않는다.
- label과 notes는 ko/en/zh/vi 네 언어를 모두 채운다. ko에는 공지 원문을 그대로
  두고, en·zh·vi에는 그 뜻을 옮긴다. 이 앱을 쓰는 사람은 한국어를 못 읽는
  유학생이라, 번역이 없으면 자기 납부 기간을 알 수 없다.
- 번역할 때 "2026학년도 2학기"처럼 한국 학사 용어는 뜻이 통하게 옮긴다
  (예: en "Fall semester 2026"). 학교명과 은행명은 통용되는 표기를 쓴다.
- 원문에 없는 값은 만들어내지 않는다. 모르면 배열은 비우고 null을 쓴다.`;

type Extracted = Omit<EnrollmentNotice, "schoolId" | "fromSnapshot" | "sources" | "fetchedAt" | "terms"> & {
  methods: string[];
  virtualAccountBank: string | null;
  splitTransferAllowed: boolean;
  splitTransferNote: EnrollmentNotice["terms"]["splitTransferNote"];
  notes: EnrollmentNotice["terms"]["notes"];
};

/**
 * 대학 공지 원문을 구조화된 등록 일정으로 바꾼다.
 *
 * 정규식 대신 LLM을 쓰는 이유: 날짜 구간 표기가 학교마다 전혀 다르다.
 * 고려대는 월 제목("08월") 아래 "24(월) - 28(금) 16:00", 한양대는
 * "2026.08.24.(월) ~ 08.30.(일)"로 쓴다. 게다가 공지 HTML이
 * <span style="letter-spacing">로 문장 중간을 쪼개 놓는다. 학교 수만큼
 * 정규식을 두면 매 학기 공지 개편마다 깨지지만, LLM은 문맥에서 연도와
 * 월을 스스로 채워 넣는다.
 */
export async function extractEnrollmentNotice(
  schoolId: SchoolId,
  docs: RawDoc[]
): Promise<EnrollmentNotice> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 학교에 따라 일정과 납부방법이 한 페이지에 같이 있기도 하고 나뉘어 있기도
  // 하다. 어느 쪽이든 라벨을 붙여 그대로 넘기고 판단은 모델에 맡긴다.
  const input = docs.map((doc) => `[${SECTION_LABEL[doc.kind]}]\n${doc.text}`).join("\n\n");

  const interaction = await ai.interactions.create({
    model: MODEL,
    input,
    system_instruction: SYSTEM,
    response_format: { type: "text", mime_type: "application/json", schema: RESPONSE_SCHEMA },
  });

  const text = interaction.output_text;
  if (!text) throw new Error("Gemini returned no output_text");
  const extracted = JSON.parse(text) as Extracted;

  return {
    schoolId,
    academicYear: extracted.academicYear,
    semester: extracted.semester,
    entries: extracted.entries,
    terms: {
      methods: extracted.methods,
      virtualAccountBank: extracted.virtualAccountBank,
      splitTransferAllowed: extracted.splitTransferAllowed,
      splitTransferNote: extracted.splitTransferNote,
      notes: extracted.notes,
    },
    fromSnapshot: docs.some((doc) => doc.fromSnapshot),
    sources: docs.map((doc) => doc.url),
    fetchedAt: new Date().toISOString(),
  };
}
