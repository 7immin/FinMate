import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupportInquiry, SupportInquiryCategory } from "@/lib/types";

interface InquiryRow {
  id: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

function toInquiry(row: InquiryRow): SupportInquiry {
  return {
    id: row.id,
    category: row.category as SupportInquiryCategory,
    message: row.message,
    status: row.status as SupportInquiry["status"],
    createdAt: row.created_at,
  };
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("support_inquiries")
    .select("id, category, message, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ inquiries: (data as InquiryRow[]).map(toInquiry) });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { category, message } = await request.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("support_inquiries")
    .insert({ user_id: user.id, category, message: message.trim() })
    .select("id, category, message, status, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ inquiry: toInquiry(data as InquiryRow) });
}
