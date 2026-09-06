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
      description:
        "답변을 읽은 사람이 지금 바로 그 화면에서 할 일이 있을 때만 채운다. 그 외에는 반드시 null.",
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
  // action을 required에서 뺀다. 반드시 채워야 하는 칸으로 두면 모델이
  // 관련 없는 답변에도 아무 화면이나 골라 넣는다 — "계좌 개설 수수료"를
  // 물었는데 "금융여권 확인하기"가 붙던 이유다.
  required: ["reply"],
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
판단 기준은 하나입니다. **당신이 방금 쓴 답변에서, 사용자가 다음에 해야 할 일을 지목했는가?**
지목했고 그 일을 하는 화면이 아래 목록에 있으면 action을 채우고, 아니면 null입니다.

채우는 예:
- "등록금 낼 돈이 부족해요" → 분납 신청이나 한도 열기를 하라고 답했다면 /tuition
- "이 알바 공고 사기인가요?", "통장 빌려달래요" → 진단해 보라고 답했다면 /shield
- "외국인등록증이 없으면 계좌를 못 만드나요?" → 먼저 등록증을 등록하라고 답했다면 /profile
- "월세 계약서 확인해 주세요" → /deposit
- "내 한도가 얼마인가요?" → /passport

null로 두는 예:
- "계좌 개설에 수수료 있나요?" → 수수료 유무를 답하면 끝이다. 할 일이 남지 않는다.
- "외국인등록증이 뭔가요?", "전세와 월세 차이가 뭔가요?" → 설명으로 끝난다.
- 답변이 앱 밖에서 할 일(출입국사무소 방문, 학교 문의)로 끝나는 경우.
- 어느 화면인지 애매한 경우.

화면 이름만 적은 버튼은 만들지 마세요. "금융여권 확인하기"가 아니라 거기서 할 일을 적습니다.

버튼 문구는 그 화면에서 할 일을 적으세요. "금융여권 확인하기"처럼 화면 이름만 적지 마세요.

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
