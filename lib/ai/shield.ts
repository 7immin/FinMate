import { GoogleGenAI } from "@google/genai";
import { Language, ThreatScanResult } from "@/lib/types";

const MODEL = "gemini-3.1-flash-lite";

const LANGUAGE_NAME: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  zh: "중국어(简体中文)",
  vi: "베트남어(Tiếng Việt)",
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    risk: {
      type: "string",
      enum: ["critical", "high", "caution", "safe"],
      description: "위험도. 애매하면 한 단계 높게 잡는다.",
    },
    types: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "account_rental",
          "cash_courier",
          "unregistered_remittance",
          "impersonation",
          "investment_fraud",
          "phishing_link",
          "none",
        ],
      },
      description: "해당하는 수법. 위험 신호가 없으면 [\"none\"].",
    },
    highlights: {
      type: "array",
      items: { type: "string" },
      description: "원문에 실제로 등장한 위험 구절만 그대로 옮긴다. 원문 언어 그대로 둔다.",
    },
    explanation: { type: "string", description: "무슨 일이 벌어지는지 3문장 이내로." },
    consequences: { type: "array", items: { type: "string" }, description: "실제 결과 2~4개." },
    actions: { type: "array", items: { type: "string" }, description: "지금 할 일 2~4개." },
  },
  required: ["risk", "types", "highlights", "explanation", "consequences", "actions"],
};

/**
 * 한국 법령상의 실제 결과. 프롬프트에 사실로 못 박아 둔다.
 *
 * 처벌 수위나 조항을 모델이 지어내면 그 자체가 잘못된 법률 안내가 된다.
 * 모델에게 "무엇이 사실인지"는 여기서 주고, "사용자 언어로 어떻게 설명할지"만 맡긴다.
 */
const GROUNDED_CONSEQUENCES = `
- 통장·체크카드·계좌 양도 및 대여: 전자금융거래법 제6조 제3항 위반.
  같은 법 제49조 제4항에 따라 5년 이하의 징역 또는 3천만원 이하의 벌금.
- 보이스피싱에 이용된 계좌: 지급정지되고, 전 금융기관에서 신규 계좌 개설과 비대면 거래가
  최장 1년간 제한된다. 본인이 속아서 빌려준 경우에도 계좌는 정지된다.
- 현금 수거·전달책: 본인이 몰랐다고 주장해도 사기방조 또는 사기 공범으로 처벌될 수 있다.
- 무등록 환전·송금(환치기): 외국환거래법 위반.
- 외국인의 경우 형사처벌을 받으면 체류자격 취소나 강제퇴거로 이어질 수 있다.
- 신고·상담 창구: 경찰 112, 금융감독원 1332.
`.trim();

const FEW_SHOT = `
[사례 1] "통장 하나만 빌려주면 하루 30만원. 그냥 잠깐 쓰고 돌려줄게요."
→ critical / account_rental. 계좌 양도 유인이다. 어떤 명목이든 타인에게 계좌를 넘기는 것은
  그 자체로 범죄이며, 빌려준 사람도 처벌받고 계좌가 정지된다.

[사례 2] "고객이 맡긴 현금을 받아서 지정 장소에 전달만 하면 됩니다. 일당 20만원, 신원조회 없음."
→ critical / cash_courier. 정상적인 일에 '신원조회 없음'과 과도한 일당이 붙지 않는다.
  보이스피싱 피해금 수거책 모집의 전형이다.

[사례 3] "서울중앙지검입니다. 귀하 명의 계좌가 범죄에 연루되어 안전계좌로 자금을 이체해야 합니다."
→ critical / impersonation. 수사기관은 전화로 자금 이체를 요구하지 않으며 '안전계좌'라는
  제도 자체가 없다.

[사례 4] "은행보다 환율 좋아요. 제 한국 계좌로 원화 보내면 위안화로 바로 보내드립니다."
→ high / unregistered_remittance. 무등록 송금이며, 그 계좌가 범죄 자금 세탁에 쓰이면
  송금한 사람의 계좌까지 정지될 수 있다.

[사례 5] "유학생 전용 재테크. 원금 보장, 월 10% 확정 수익."
→ high / investment_fraud. 원금 보장과 확정 고수익을 동시에 약속하는 상품은 존재하지 않는다.

[사례 6] "다음 주 월요일 오후 3시에 학과 사무실에서 장학금 서류 제출 마감입니다."
→ safe / none. 금전 요구도 계좌 요구도 없다. 위험 신호가 없으면 억지로 위험하다고 하지 않는다.
`.trim();

function buildInstruction(language: Language): string {
  return `당신은 한국에 체류하는 외국인 유학생을 금융범죄로부터 보호하는 분석기다.
사용자가 받은 메시지, 구인 공고, 채팅 캡처를 읽고 위험도를 판정한다.

판정 원칙:
- 위험을 놓치는 쪽이 과잉 경고보다 치명적이다. 애매하면 한 단계 높게 잡는다.
- 다만 위험 신호가 실제로 없으면 safe로 판정한다. 모든 것을 위험하다고 하면 경고가 무의미해진다.
- highlights에는 원문에 실제로 등장한 구절만 그대로 옮긴다. 없는 문장을 지어내지 않는다.
- 아래에 주어진 법적 결과만 사용한다. 조문이나 처벌 수위를 새로 만들어내지 않는다.

실제 법적 결과:
${GROUNDED_CONSEQUENCES}

판정 예시:
${FEW_SHOT}

출력 언어 규칙:
- explanation, consequences, actions는 반드시 ${LANGUAGE_NAME[language]}로 쓴다.
- highlights는 원문 언어 그대로 둔다 (사용자가 원문에서 찾을 수 있어야 하므로).
- explanation은 3문장 이내. 법률 용어보다 무슨 일이 벌어지는지를 쉽게 쓴다.
- 화면은 마크다운을 렌더링하지 않는다. 별표(**), #, - 같은 기호를 쓰지 말고 일반 문장으로만 쓴다.`;
}

export interface ScanInput {
  text: string;
  language: Language;
  /** 채팅 캡처를 그대로 올린 경우. */
  image?: { data: string; mimeType: string };
}

export async function scanThreat(input: ScanInput): Promise<ThreatScanResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = input.text.trim()
    ? `다음 내용을 진단하라:\n\n"""\n${input.text.trim()}\n"""`
    : "첨부된 이미지의 내용을 진단하라.";

  // 배열을 만들어 push하면 SDK의 입력 유니온 타입으로 좁혀지지 않는다.
  // ocr.ts와 같이 리터럴로 넘긴다.
  const interaction = await ai.interactions.create({
    model: MODEL,
    input: input.image
      ? [
          { type: "text", text: prompt },
          { type: "image", data: input.image.data, mime_type: input.image.mimeType },
        ]
      : [{ type: "text", text: prompt }],
    system_instruction: buildInstruction(input.language),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: RESPONSE_SCHEMA,
    },
  });

  const text = interaction.output_text;
  if (!text) throw new Error("Gemini returned no output_text");
  return JSON.parse(text) as ThreatScanResult;
}
