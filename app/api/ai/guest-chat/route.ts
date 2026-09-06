import { NextResponse } from "next/server";
import { askFinMateGuest } from "@/lib/ai/guest";
import { Language } from "@/lib/types";

const LANGUAGES: Language[] = ["ko", "en", "zh", "vi"];

/**
 * 로그인 없이 물어볼 수 있는 창구.
 *
 * 인증을 요구하지 않으므로 미들웨어의 API 차단에서 예외로 빠져 있다
 * (middleware.ts의 PUBLIC_API_PATHS). 그만큼 이 라우트는 사용자 데이터를
 * 한 줄도 읽지 않는다 — Supabase를 아예 부르지 않고, 받은 질문과 언어만
 * 모델에 넘긴다. 로그인 사용자용 /api/ai/chat과 파일을 나눠 둔 이유가
 * 이것이다. 한 라우트에 분기를 두면 언젠가 개인 데이터가 비로그인 경로로
 * 새는 실수가 나온다.
 */
export async function POST(request: Request) {
  const { message, language, previousInteractionId } = await request.json();

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "invalid message" }, { status: 400 });
  }
  // 길이를 자른다. 인증 없이 열려 있는 창구라 본문 길이를 제한하지 않으면
  // 그대로 토큰 비용이 된다.
  if (message.length > 1000) {
    return NextResponse.json({ error: "message too long" }, { status: 413 });
  }

  const lang: Language = LANGUAGES.includes(language) ? language : "ko";

  try {
    const result = await askFinMateGuest(
      message.trim(),
      lang,
      typeof previousInteractionId === "string" ? previousInteractionId : undefined
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("Guest AI chat error:", err);
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }
}
