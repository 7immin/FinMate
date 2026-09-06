import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DocumentFlags } from "@/lib/types";

const COLUMN_MAP: Record<keyof DocumentFlags, string> = {
  hasPassport: "has_passport",
  hasAlienRegistration: "has_alien_registration",
  hasKoreanPhone: "has_korean_phone",
};

/**
 * 사진으로 확인해야만 "있음"이 되는 서류.
 *
 * 여권과 외국인등록증은 신분을 증명하는 서류라, 본인이 "있다"고 누르는
 * 것만으로는 아무것도 보증하지 못한다. 그런데 계좌 개설 흐름의 서류
 * 체크가 이 라우트로 곧장 "yes"를 보내고 있었다 — 내 정보에서는 사진을
 * 요구하면서 다른 화면에서는 버튼 한 번으로 통과됐다.
 *
 * 화면 쪽만 고치면 다음에 화면이 하나 더 생길 때 같은 구멍이 다시 난다.
 * 서버에서 막는다. 이 서류들을 "있음"으로 바꾸는 길은 /api/passport/verify
 * 하나뿐이고, 거기는 실제로 문서를 읽는다.
 *
 * 휴대폰 번호는 여기 없다. 올릴 서류가 없어 본인이 고르는 값이다.
 */
const VERIFIED_ONLY: (keyof DocumentFlags)[] = ["hasPassport", "hasAlienRegistration"];

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const patch: Partial<DocumentFlags> = await request.json();

  // "없음"이나 "확인 필요"로 되돌리는 것은 막지 않는다. 잘못 눌렀거나
  // 등록증을 잃어버린 경우가 있고, 그 방향은 권한을 얻는 쪽이 아니다.
  const blocked = VERIFIED_ONLY.filter((key) => patch[key] === "yes");
  if (blocked.length > 0) {
    return NextResponse.json(
      { error: "verification_required", fields: blocked },
      { status: 403 }
    );
  }

  const update: Record<string, string> = {};
  (Object.keys(patch) as (keyof DocumentFlags)[]).forEach((key) => {
    if (patch[key]) update[COLUMN_MAP[key]] = patch[key] as string;
  });

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("document_flags")
    .update(update)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    documents: {
      hasPassport: data.has_passport,
      hasAlienRegistration: data.has_alien_registration,
      hasKoreanPhone: data.has_korean_phone,
    },
  });
}
