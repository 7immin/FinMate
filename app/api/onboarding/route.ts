import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAppState } from "@/lib/server/state";
import { cloneChecklist } from "@/lib/mock/passport-levels";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, nationality, nationalityCode, visaStatus, school, arrivalLabel, language } = body;

  const { error } = await supabase.rpc("complete_onboarding", {
    p_name: name,
    p_nationality: nationality,
    p_nationality_code: nationalityCode,
    p_visa_status: visaStatus,
    p_school: school,
    p_arrival_label: arrivalLabel,
    p_language: language,
    p_checklist: cloneChecklist("S1"),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { state } = await fetchAppState();
  return NextResponse.json({ state });
}
