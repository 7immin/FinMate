import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DocumentFlags } from "@/lib/types";

const COLUMN_MAP: Record<keyof DocumentFlags, string> = {
  hasPassport: "has_passport",
  hasAlienRegistration: "has_alien_registration",
  hasKoreanPhone: "has_korean_phone",
};

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const patch: Partial<DocumentFlags> = await request.json();
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
