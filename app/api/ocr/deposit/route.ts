import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractDocumentData } from "@/lib/ai/ocr";

const SCHEMA = {
  type: "object",
  properties: {
    address: { type: "string", description: "임대 목적물의 주소" },
    deposit: { type: "number", description: "보증금, 원(KRW) 단위 숫자만" },
    rent: { type: "number", description: "월세, 원(KRW) 단위 숫자만 (전세면 0)" },
    rentDay: { type: "string", description: "월세 납부일 (예: 매월 1일)" },
    period: { type: "string", description: "계약 기간, 'YYYY.MM.DD - YYYY.MM.DD' 형식" },
  },
  required: ["address", "deposit", "rent", "rentDay", "period"],
};

const PROMPT = `이 이미지 또는 PDF는 한국의 임대차(월세/전세) 계약서입니다. 다음 정보를 정확히 추출하세요:
- 목적물 주소
- 보증금 (숫자만, 원 단위)
- 월세 (숫자만, 원 단위, 전세 계약이면 0)
- 월세 납부일
- 계약 기간 (YYYY.MM.DD - YYYY.MM.DD 형식)
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
    console.error("Deposit OCR error:", err);
    return NextResponse.json({ error: "ocr_error" }, { status: 502 });
  }
}
