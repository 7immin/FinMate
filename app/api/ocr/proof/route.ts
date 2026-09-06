import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractDocumentData } from "@/lib/ai/ocr";

/**
 * 증빙 서류가 고른 종류와 맞는지 확인한다.
 *
 * 예전에는 파일을 아무거나 올려도 그대로 요청이 올라갔다. 담당자는
 * "근로계약서"라는 글자와 파일명만 보고 승인 여부를 정하게 되고, 정작
 * 그 파일이 셀카여도 알 수 없었다.
 *
 * 여기서 하는 것은 "이 문서가 그 종류로 보이는가"까지다. 진위 판별이
 * 아니다 — 위조 여부는 모델이 판단할 수 없고, 그건 결국 담당자가
 * 원본을 보고 정할 일이다. 다만 명백히 다른 문서를 걸러내는 것만으로도
 * 담당자에게 가는 요청의 질이 달라진다.
 */
const PROOF_LABEL: Record<string, string> = {
  employment: "근로계약서 또는 급여명세서 (고용주, 급여액, 근로 기간이 적힌 문서)",
  homeRemittance: "본국에서 받은 송금 내역 (은행 거래내역서, 입금 내역)",
  scholarship: "장학금 수여 증명서 (학교나 재단이 발급한 장학금 증명)",
  "tuition-invoice": "대학 등록금 고지서",
  "lease-contract": "임대차 계약서",
};

const SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "boolean",
      description: "이 문서가 요구된 종류로 보이면 true.",
    },
    documentKind: {
      type: "string",
      description: "실제로 무슨 문서인지 한 마디로. 예: 근로계약서, 여권 사진, 풍경 사진, 알 수 없음",
    },
    reason: {
      type: "string",
      description: "그렇게 판단한 이유 한 문장. 사용자에게 그대로 보여줄 말로 쓴다.",
    },
  },
  required: ["matches", "documentKind", "reason"],
};

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, mimeType, proofType } = await request.json();
  if (typeof data !== "string" || typeof mimeType !== "string") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const expected = PROOF_LABEL[proofType];
  if (!expected) return NextResponse.json({ error: "unknown proof type" }, { status: 400 });

  const prompt = `이 파일이 다음 종류의 서류인지 판단하세요.

요구된 서류: ${expected}

판단 기준:
- 문서의 종류만 봅니다. 내용이 사실인지, 위조인지는 판단하지 마세요.
- 사진, 스크린샷, 신분증, 빈 문서, 다른 종류의 계약서처럼 명백히 다른 것이면 matches를 false로 두세요.
- 흐릿하거나 일부만 찍혔더라도 그 종류의 서류로 보이면 matches를 true로 둡니다.
- 판단이 어려우면 false로 두고 reason에 무엇이 안 보이는지 적으세요.
- reason은 사용자에게 그대로 보여줄 문장입니다. 한국어로, 한 문장으로, 다음에 뭘 하면 되는지 알 수 있게 쓰세요.`;

  try {
    const result = await extractDocumentData<{
      matches: boolean;
      documentKind: string;
      reason: string;
    }>({ base64Data: data, mimeType, prompt, schema: SCHEMA });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Proof check error:", err);
    return NextResponse.json({ error: "check_error" }, { status: 502 });
  }
}
