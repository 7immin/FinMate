import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scanThreat } from "@/lib/ai/shield";
import { Language } from "@/lib/types";

const LANGUAGES: Language[] = ["ko", "en", "zh", "vi"];

/**
 * 사기 진단.
 *
 * 받은 메시지나 구인 공고를 그대로 붙여넣으면 위험도를 판정한다.
 *
 * 진단 내용은 저장하지 않는다. 사용자가 여기 붙여넣는 것은 대개 남과
 * 주고받은 대화이고, 그중에는 본인 것이 아닌 정보도 섞인다. 판정에만
 * 쓰고 흘려보내는 것이 맞다 — 남겨 두면 언젠가 그 기록이 새어 나갈 수
 * 있고, 남겨서 얻는 것도 없다.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { text, language, image } = await request.json();

  const hasText = typeof text === "string" && text.trim().length > 0;
  const hasImage = image && typeof image.data === "string" && typeof image.mimeType === "string";
  if (!hasText && !hasImage) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  if (hasText && text.length > 4000) {
    return NextResponse.json({ error: "text too long" }, { status: 413 });
  }

  const lang: Language = LANGUAGES.includes(language) ? language : "ko";

  try {
    const result = await scanThreat({
      text: hasText ? text : "",
      language: lang,
      image: hasImage ? { data: image.data, mimeType: image.mimeType } : undefined,
    });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Shield scan error:", err);
    return NextResponse.json({ error: "scan_error" }, { status: 502 });
  }
}
