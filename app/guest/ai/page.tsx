"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { ChatMessage, ChatMessageData, TypingIndicator } from "@/components/flows/ai/ChatMessage";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * 비로그인 상담 — 목업 1a-00에서 질문을 던졌을 때 도착하는 화면.
 *
 * 로그인 화면((app) 그룹)의 상담과 말풍선·입력줄을 그대로 공유하되,
 * /api/ai/guest-chat을 부른다. 답 위에 한 줄로 "로그인하면 내 등급과
 * 한도에 맞춘 답을 받을 수 있다"를 밝혀 둔다 — 지금 받는 답이 일반론이라는
 * 사실을 감추면, 나중에 자기 상황과 다른 답이었다는 걸 알았을 때 앱을
 * 믿지 않게 된다.
 */
function GuestAiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q");
  const { t, tNode, lang } = useTranslation();
  const suggested = tNode<string[]>("guest.suggested") ?? [];

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
      const res = await fetch("/api/ai/guest-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          language: lang,
          previousInteractionId: interactionIdRef.current,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      interactionIdRef.current = data.interactionId;
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: t("ai.errorMessage"), isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell className="flex flex-col">
      <TopBar
        title={t("guest.chatTitle")}
        onBack={() => router.push("/")}
        right={
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="shrink-0 whitespace-nowrap rounded-full border border-primary/45 bg-primary/[0.12] px-3 py-1.5 text-[11.5px] font-medium text-primary"
          >
            {t("guest.login")}
          </button>
        }
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-[22px] font-bold text-foreground">
              {t("ai.landingHeadline")}
            </h1>
            <p className="mt-2 text-[15px] text-foreground-muted">{t("guest.chatNotice")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {suggested.map((q) => (
                <Chip key={q} onClick={() => send(q)}>
                  {q}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs leading-relaxed text-foreground-muted">
              {t("guest.chatNotice")}
            </p>
            {messages.map((m, idx) => (
              <ChatMessage key={idx} message={m} />
            ))}
          </>
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
          placeholder={t("guest.askPlaceholder")}
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

export default function GuestAiPage() {
  return (
    <Suspense fallback={null}>
      <GuestAiContent />
    </Suspense>
  );
}
