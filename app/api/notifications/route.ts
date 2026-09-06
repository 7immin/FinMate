import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NotificationSettings } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const settings: NotificationSettings = await request.json();

  const { data, error } = await supabase
    .from("profiles")
    .update({ notification_settings: settings })
    .eq("user_id", user.id)
    .select("notification_settings")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ notificationSettings: data.notification_settings });
}
