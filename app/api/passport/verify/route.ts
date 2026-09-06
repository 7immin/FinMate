import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractDocumentData } from "@/lib/ai/ocr";
import { completeDocumentVerifiedItem, getPassportRow, toPassportState } from "@/lib/server/passport";

interface Verifier {
  schema: Record<string, unknown>;
  prompt: string;
  isMeaningful: (result: Record<string, unknown>) => boolean;
  /**
   * 내 정보 > 보유 서류는 여권을 실제로 확인하기 전부터 있던, 자기 신고
   * 값(has_passport)이다. OCR로 실제 확인이 끝났는데 그 칸이 여전히
   * "확인 필요"로 남으면 두 화면이 서로 다른 말을 하게 된다. 여기서
   * 확인이 성공한 항목이 있으면 그 칸도 같이 "있음"으로 옮겨 둔다.
   */
  documentFlagColumn?: string;
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
    documentFlagColumn: "has_passport",
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
    // 무엇을 보고 실패했는지 함께 돌려준다. "인식하지 못했어요"만 띄우면
    // 사용자는 같은 사진을 몇 번이고 다시 올린다 — 다른 문서를 올린
    // 것인지, 흐려서 못 읽은 것인지 구분할 방법이 없기 때문이다.
    console.warn(`Verify failed for ${itemId}:`, result);
    return NextResponse.json({ ok: false, result });
  }

  const row = await getPassportRow(supabase, user.id);
  const updated = await completeDocumentVerifiedItem(supabase, user.id, row, itemId);

  let documents: { hasPassport: string; hasAlienRegistration: string; hasKoreanPhone: string } | undefined;
  if (verifier.documentFlagColumn) {
    const { data } = await supabase
      .from("document_flags")
      .update({ [verifier.documentFlagColumn]: "yes" })
      .eq("user_id", user.id)
      .select()
      .single();
    if (data) {
      documents = {
        hasPassport: data.has_passport,
        hasAlienRegistration: data.has_alien_registration,
        hasKoreanPhone: data.has_korean_phone,
      };
    }
  }

  return NextResponse.json({ ok: true, result, passport: toPassportState(updated), documents });
}
