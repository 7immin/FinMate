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

  "arc-verify": {
    schema: {
      type: "object",
      properties: {
        isArc: {
          type: "boolean",
          description: "이 이미지가 대한민국 외국인등록증(또는 거소신고증)이면 true.",
        },
        documentKind: {
          type: "string",
          description:
            "실제로 무슨 문서로 보이는지 한 마디로. 예: 외국인등록증, 여권, 학생증, 빈 카드 양식, 사람 사진, 알 수 없음",
        },
        name: { type: "string", description: "카드에 적힌 영문 성명" },
        visaStatus: { type: "string", description: "체류자격. 예: D-2, D-4, F-2" },
        expiryDate: { type: "string", description: "체류기간 만료일, YYYY.MM.DD 형식" },
      },
      required: ["isArc", "documentKind", "name", "visaStatus", "expiryDate"],
    },
    // 외국인등록번호는 일부러 읽지 않는다. 주민등록번호와 같은 자리의
    // 고유식별정보라 우리가 가질 이유가 없고, 모델도 그런 번호를 뱉기를
    // 거부해 인식이 통째로 실패한다.
    prompt: `이 이미지가 대한민국 외국인등록증(ARC) 또는 국내거소신고증인지 판단하고, 맞으면 카드에 적힌 정보를 읽으세요.

- isArc: 외국인등록증이나 거소신고증으로 보이면 true, 다른 문서나 사진이면 false.
- documentKind: 실제로 무슨 문서로 보이는지 한 마디로. 사용자에게 그대로 보여줄 말입니다.
- name: 카드에 적힌 영문 성명.
- visaStatus: 체류자격 (예: D-2, D-4, F-2). 카드에 'STATUS' 또는 '체류자격'으로 적혀 있습니다.
- expiryDate: 체류기간 만료일 (YYYY.MM.DD).

외국인등록번호는 읽지 마세요. 필요하지 않습니다.
카드가 기울어져 있거나 일부가 흐려도, 사진 칸이 비어 있거나 견본이어도, 외국인등록증의 양식으로
보이면 isArc를 true로 두세요. 우리가 확인하려는 것은 위조 여부가 아니라 어떤 종류의 서류인가입니다.
읽을 수 없는 항목은 빈 문자열로 두고, 절대 추측해서 지어내지 마세요.`,
    // 통과 기준은 "이것이 외국인등록증인가" 하나다. 이름까지 요구하면
    // 카드가 분명히 맞는데도 인쇄가 작아 못 읽었을 때 통째로 실패한다.
    isMeaningful: (r) => r.isArc === true,
    documentFlagColumn: "has_alien_registration",
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
