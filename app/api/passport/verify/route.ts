import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractDocumentData } from "@/lib/ai/ocr";
import { completeDocumentVerifiedItem, getPassportRow, toPassportState } from "@/lib/server/passport";

interface Verifier {
  schema: Record<string, unknown>;
  prompt: string;
  isMeaningful: (result: Record<string, unknown>) => boolean;
}

const VERIFIERS: Record<string, Verifier> = {
  "passport-verify": {
    schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "여권에 적힌 영문 성명" },
        passportNumber: { type: "string", description: "여권번호" },
        nationality: { type: "string", description: "국적" },
        expiryDate: { type: "string", description: "여권 만료일, YYYY.MM.DD 형식" },
      },
      required: ["name", "passportNumber", "nationality", "expiryDate"],
    },
    prompt:
      "이 이미지는 여권 정보면(사진이 있는 신원정보 페이지)입니다. 성명(영문 표기), 여권번호, 국적, 만료일(YYYY.MM.DD)을 추출하세요. 읽을 수 없는 항목은 빈 문자열로 채우세요. 절대 추측해서 지어내지 마세요.",
    isMeaningful: (r) => Boolean(r.name) && Boolean(r.passportNumber),
  },
  "korean-account": {
    schema: {
      type: "object",
      properties: {
        bankName: { type: "string", description: "은행명" },
        accountNumber: { type: "string", description: "계좌번호" },
        accountHolder: { type: "string", description: "예금주명" },
      },
      required: ["bankName", "accountNumber", "accountHolder"],
    },
    prompt:
      "이 이미지는 한국 은행 통장 사본이거나 은행 앱의 계좌 정보 화면입니다. 은행명, 계좌번호, 예금주명을 추출하세요. 읽을 수 없는 항목은 빈 문자열로 채우세요. 절대 추측해서 지어내지 마세요.",
    isMeaningful: (r) => Boolean(r.bankName) && Boolean(r.accountNumber),
  },
};

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { itemId, data, mimeType } = await request.json();
  const verifier = VERIFIERS[itemId];
  if (!verifier) return NextResponse.json({ error: "not_verifiable" }, { status: 400 });
  if (typeof data !== "string" || typeof mimeType !== "string") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  let result: Record<string, unknown>;
  try {
    result = await extractDocumentData<Record<string, unknown>>({
      base64Data: data,
      mimeType,
      prompt: verifier.prompt,
      schema: verifier.schema,
    });
  } catch (err) {
    console.error("Passport verify OCR error:", err);
    return NextResponse.json({ error: "ocr_error" }, { status: 502 });
  }

  if (!verifier.isMeaningful(result)) {
    return NextResponse.json({ ok: false, result });
  }

  const row = await getPassportRow(supabase, user.id);
  const updated = await completeDocumentVerifiedItem(supabase, user.id, row, itemId);

  return NextResponse.json({ ok: true, result, passport: toPassportState(updated) });
}
