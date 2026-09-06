import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAppState } from "@/lib/server/state";
import { askFinMateAi } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { message, previousInteractionId } = await request.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "invalid message" }, { status: 400 });
  }

  const { state } = await fetchAppState();
  if (!state) return NextResponse.json({ error: "no profile" }, { status: 400 });

  try {
    const result = await askFinMateAi(message, state, previousInteractionId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }
}
