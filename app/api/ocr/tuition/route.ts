import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractDocumentData } from "@/lib/ai/ocr";

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "고지서 제목 (예: 2026학년도 2학기 등록금)" },
    institution: {
      type: "string",
      description: "고지서를 발급한 학교 이름. 문서에 적힌 그대로 (예: 한양대학교). 없으면 빈 문자열.",
    },
    amount: { type: "number", description: "납부해야 할 총 금액, 원(KRW) 단위 숫자만" },
    dueDate: { type: "string", description: "납부 기한, 'YYYY.MM.DD' 형식" },
    virtualAccount: { type: "string", description: "입금 전용 가상계좌 번호" },
    virtualAccountBank: {
      type: "string",
      description: "가상계좌의 은행명 (예: 하나은행, 우리은행). 없으면 빈 문자열.",
    },
    accountHolder: {
      type: "string",
      description: "가상계좌의 예금주. 고지서에 적힌 그대로. 없으면 빈 문자열.",
    },
  },
  required: [
    "title",
    "institution",
    "amount",
    "dueDate",
    "virtualAccount",
    "virtualAccountBank",
    "accountHolder",
  ],
};

const PROMPT = `이 이미지 또는 PDF는 한국 대학교의 등록금 고지서입니다. 다음 정보를 정확히 추출하세요:
- 고지서 제목
- 발급한 학교 이름 (문서에 적힌 그대로)
- 납부해야 할 총 금액 (숫자만, 원 단위)
- 납부 기한 (YYYY.MM.DD 형식)
- 입금 전용 가상계좌 번호
- 그 가상계좌의 은행명
- 그 가상계좌의 예금주
문서에서 읽을 수 없는 항목은 빈 문자열이나 0으로 채우세요. 절대 추측해서 지어내지 마세요.`;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, mimeType } = await request.json();
  if (typeof data !== "string" || typeof mimeType !== "string") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    const result = await extractDocumentData({
      base64Data: data,
      mimeType,
      prompt: PROMPT,
      schema: SCHEMA,
    });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Tuition OCR error:", err);
    return NextResponse.json({ error: "ocr_error" }, { status: 502 });
  }
}
