"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { ChatMessage, ChatMessageData, TypingIndicator } from "@/components/flows/ai/ChatMessage";
import { useTranslation } from "@/lib/i18n/useTranslation";

function AiPageContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q");
  const { t, tNode } = useTranslation();
  const suggested = tNode<string[]>("ai.suggested");

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const interactionIdRef = useRef<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);
  const askedInitial = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuestion && !askedInitial.current) {
      askedInitial.current = true;
      send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setDraft("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          previousInteractionId: interactionIdRef.current,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      interactionIdRef.current = data.interactionId;
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply, action: data.action }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: t("ai.errorMessage"), isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell className="flex flex-col">
      <TopBar title={t("ai.topBarTitle")} />

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-[22px] font-bold text-foreground">{t("ai.landingHeadline")}</h1>
            <p className="mt-2 text-[15px] text-foreground-muted">{t("ai.landingDesc")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {suggested.map((q) => (
                <Chip key={q} onClick={() => send(q)}>
                  {q}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, idx) => <ChatMessage key={idx} message={m} />)
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border px-5 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(draft);
          }}
          placeholder={t("home.askPlaceholder")}
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => send(draft)}
          disabled={loading}
          aria-label={t("common.sendQuestion")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AppShell>
  );
}

export default function AiPage() {
  return (
    <Suspense fallback={null}>
      <AiPageContent />
    </Suspense>
  );
}
