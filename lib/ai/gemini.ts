import { GoogleGenAI } from "@google/genai";
import { AppState } from "@/lib/types";
import { LEVEL_ORDER } from "@/lib/mock/passport-levels";

const MODEL = "gemini-3.1-flash-lite";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "사용자 질문에 대한 답변. 2~5문장, 실행 가능한 다음 행동 중심으로 간결하게.",
    },
    action: {
      type: ["object", "null"],
      description: "답변과 직접 관련된 다음 행동이 있으면 제안. 없으면 null.",
      properties: {
        label: { type: "string", description: "버튼에 표시할 짧은 문구 (예: 학비 한도 열기)" },
        href: {
          type: "string",
          enum: [
            "/tuition",
            "/remittance",
            "/account",
            "/deposit",
            "/passport",
            "/profile",
            "/shield",
            "/notice",
            "/home",
          ],
        },
      },
      required: ["label", "href"],
    },
  },
  required: ["reply", "action"],
};

const LANGUAGE_NAME: Record<string, string> = {
  ko: "한국어",
  en: "English",
  zh: "중국어(简体中文)",
  vi: "베트남어(Tiếng Việt)",
};

function buildSystemInstruction(state: AppState): string {
  const { profile, passport, documents } = state;
  const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(passport.level) + 1];

  return `당신은 한국에 거주하는 외국인 유학생을 위한 금융 앱 "FinMate"의 AI 상담사입니다.

# 서비스 원칙
- FinMate는 "목적을 증명하면 이체 한도가 열린다"는 컨셉의 앱입니다. 학비 납부, 해외송금, 계좌개설, 월세·보증금 4가지가 핵심 기능입니다.
- 사설 대출, 고금리 대부업체는 절대 추천하지 않습니다. 유학생 대상 사기가 많다는 점을 필요시 안내하세요.
- 은행 비밀번호나 계좌 비밀번호를 묻지 않습니다.
- 반드시 ${LANGUAGE_NAME[profile.language] ?? "한국어"}로 답변하세요.
- 답변은 짧고 실용적으로, 다음에 뭘 해야 하는지 명확히 안내하세요.
- 화면은 마크다운을 렌더링하지 않습니다. 별표(**), #, - 같은 마크다운 기호를 절대 쓰지 말고 일반 문장으로만 답변하세요.

# 이 사용자의 실제 정보 (질문에 맞으면 이 데이터를 근거로 구체적으로 답변하세요)
- 이름: ${profile.name}
- 체류자격: ${profile.visaStatus}, 국적코드: ${profile.nationalityCode}
- 금융여권 등급: ${passport.level}${nextLevel ? ` (다음 등급 ${nextLevel}까지 체크리스트 진행 중)` : " (최고 등급)"}
- 현재 이체 한도: ${passport.currentLimit.toLocaleString()} KRW
- 보유 서류: 여권(${documents.hasPassport}), 외국인등록증(${documents.hasAlienRegistration}), 한국 휴대폰 번호(${documents.hasKoreanPhone})
  (yes=있음, no=없음, unknown=미확인)

# 다음 행동 제안
답변 내용이 아래 화면 중 하나로 바로 이어질 수 있다면 action 필드에 그 화면으로 가는 버튼을 제안하세요.
애매하면 action은 null로 두세요.

- /tuition 학비 납부  /remittance 해외송금  /account 계좌개설  /deposit 월세·보증금
- /profile 내 정보 — 여권·외국인등록증·한국 휴대폰 번호를 확인하고 등록하는 곳
- /passport 금융여권 — 등급과 한도, 등급을 올리는 체크리스트
- /shield 사기 진단  /notice 학교 등록 일정  /home 홈

특히 헷갈리기 쉬운 것: 여권·외국인등록증·휴대폰 번호 같은 보유 서류는 "내 정보"(/profile)에 있습니다.
금융여권(/passport)이 아닙니다. 서류를 등록하거나 확인하라고 안내할 때는 반드시 /profile로 보내세요.`;
}

let client: GoogleGenAI | null = null;
function getClient() {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export interface AiChatResult {
  reply: string;
  action: { label: string; href: string } | null;
  interactionId: string;
}

export async function askFinMateAi(
  message: string,
  state: AppState,
  previousInteractionId?: string
): Promise<AiChatResult> {
  const ai = getClient();

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: message,
    system_instruction: buildSystemInstruction(state),
    previous_interaction_id: previousInteractionId,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: RESPONSE_SCHEMA,
    },
  });

  let reply = interaction.output_text ?? "";
  let action: AiChatResult["action"] = null;
  try {
    const parsed = JSON.parse(interaction.output_text ?? "{}");
    if (typeof parsed.reply === "string") reply = parsed.reply;
    if (parsed.action && typeof parsed.action.href === "string") action = parsed.action;
  } catch {
    // model returned non-JSON text; fall back to showing it as-is
  }

  return { reply, action, interactionId: interaction.id };
}
