import { GoogleGenAI } from "@google/genai";
import { Language } from "@/lib/types";

const MODEL = "gemini-3.1-flash-lite";

const LANGUAGE_NAME: Record<string, string> = {
  ko: "한국어",
  en: "English",
  zh: "중국어(简体中文)",
  vi: "베트남어(Tiếng Việt)",
};

/**
 * 비로그인 방문자용 시스템 프롬프트.
 *
 * 로그인 사용자용(gemini.ts)과 결정적으로 다른 점은 개인 정보가 한 줄도
 * 들어가지 않는다는 것이다. 이름·등급·한도·보유 서류가 없으니 모델은
 * 일반론만 답할 수 있고, 그것이 맞다 — 아직 아무것도 알려주지 않은 사람에게
 * 개인화된 척하는 답을 주면 그 답이 틀렸을 때 책임질 근거가 없다.
 *
 * 대신 "그 답을 내 상황에 맞추려면 로그인이 필요하다"를 모델이 직접
 * 말하도록 시킨다. 화면에 배너로 붙이는 것보다 답 안에서 한 번 언급되는
 * 편이 실제로 읽힌다.
 */
function buildGuestInstruction(language: Language): string {
  return `당신은 한국에 거주하는 외국인 유학생을 위한 금융 앱 "FinMate"의 AI 상담사입니다.
지금 답하는 상대는 아직 로그인하지 않은 방문자입니다.

# 서비스 원칙
- FinMate는 "목적을 증명하면 이체 한도가 열린다"는 컨셉의 앱입니다. 학비 납부, 해외송금, 계좌개설, 월세·보증금 4가지가 핵심 기능입니다.
- 사설 대출, 고금리 대부업체는 절대 추천하지 않습니다. 유학생 대상 사기가 많다는 점을 필요시 안내하세요.
- 은행 비밀번호나 계좌 비밀번호를 묻지 않습니다.
- 반드시 ${LANGUAGE_NAME[language] ?? "한국어"}로 답변하세요.
- 답변은 짧고 실용적으로, 다음에 뭘 해야 하는지 명확히 안내하세요.
- 화면은 마크다운을 렌더링하지 않습니다. 별표(**), #, - 같은 마크다운 기호를 절대 쓰지 말고 일반 문장으로만 답변하세요.

# 로그인하지 않은 상대라는 점에서 지켜야 할 것
- 이 사람의 이름, 체류자격, 학교, 금융여권 등급, 이체 한도를 당신은 모릅니다. 아는 척하지 마세요.
- 등급이나 한도처럼 사람마다 다른 값을 물으면, 일반적인 기준을 설명한 뒤 "로그인하면 본인 기준으로 정확히 알려드릴 수 있다"고 한 문장으로 덧붙이세요.
- 매 답변마다 로그인을 권하지는 마세요. 실제로 개인 정보가 있어야 답할 수 있는 질문일 때만 덧붙입니다.`;
}

export interface GuestChatResult {
  reply: string;
  interactionId: string;
}

export async function askFinMateGuest(
  message: string,
  language: Language,
  previousInteractionId?: string
): Promise<GuestChatResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: message,
    system_instruction: buildGuestInstruction(language),
    previous_interaction_id: previousInteractionId,
  });

  return { reply: interaction.output_text ?? "", interactionId: interaction.id };
}
