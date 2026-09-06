import { createClient } from "@/lib/supabase/client";

export const EVIDENCE_BUCKET = "limit-evidence";

/**
 * 증빙 서류를 올린다.
 *
 * 경로를 "<user_id>/<시각>-<파일명>"으로 둔다. 첫 폴더가 자기 uid인 것만
 * 다룰 수 있도록 Storage 정책이 걸려 있어(0007 마이그레이션), 이 규칙을
 * 어기면 업로드 자체가 거부된다.
 *
 * 시각을 붙이는 이유: 같은 이름으로 두 번 올리면 앞의 파일을 덮어쓴다.
 * 그러면 이미 승인된 요청의 증빙이 나중 파일로 바뀌어, 담당자가 무엇을
 * 보고 승인했는지 알 수 없게 된다.
 *
 * 실패하면 null을 돌려준다. 업로드가 안 됐다고 요청 자체를 막지는 않는다 —
 * 파일명은 여전히 담당자에게 가고, 창구에서 원본을 보여줄 수 있다.
 * 다만 화면은 "서류가 첨부되지 않았다"고 담당자에게 밝힌다.
 */
export async function uploadEvidence(file: File): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 파일명에 한글·공백·괄호가 섞이면 Storage 키로 쓸 수 없는 문자가 있다.
  // 확장자만 지키고 나머지는 안전한 문자로 줄인다 — 원래 이름은 요청 행의
  // evidence 필드에 그대로 남으므로 담당자는 여전히 볼 수 있다.
  const dot = file.name.lastIndexOf(".");
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "bin";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    console.error("Evidence upload failed:", error.message);
    return null;
  }
  return path;
}
