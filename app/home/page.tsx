"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  GraduationCap,
  Send,
  Landmark,
  Home as HomeIcon,
  ArrowRight,
  Languages,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppState } from "@/lib/state/AppStateContext";

const QUICK_ACTIONS = [
  { href: "/tuition", label: "학비 납부", icon: GraduationCap },
  { href: "/remittance", label: "해외 송금", icon: Send },
  { href: "/account", label: "계좌 개설", icon: Landmark },
  { href: "/deposit", label: "월세·보증금", icon: HomeIcon },
];

export default function HomePage() {
  const router = useRouter();
  const { state } = useAppState();
  const { profile, passport } = state;
  const [question, setQuestion] = useState("");

  function askAgent() {
    const q = question.trim();
    router.push(q ? `/ai?q=${encodeURIComponent(q)}` : "/ai");
  }

  return (
    <AppShell showNav>
      <div className="space-y-6 px-5 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              F
            </span>
            <span className="text-[15px] font-semibold text-foreground">FinMate</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-foreground-muted">
            <Languages className="h-3.5 w-3.5" /> 한국어
          </span>
        </div>

        <div>
          <p className="text-[15px] text-foreground-muted">{profile.name} 님, 안녕하세요</p>
          <h1 className="mt-1 text-[26px] font-bold text-foreground">무엇을 도와드릴까요?</h1>
        </div>

        <Card raised className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">현재 이체 한도</p>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
              {passport.level}
            </span>
          </div>
          <p className="text-[28px] font-bold text-foreground">
            {passport.currentLimit.toLocaleString()}{" "}
            <span className="text-sm font-normal text-foreground-muted">KRW</span>
          </p>
          <ProgressBar value={(passport.currentLimit / 2000000) * 100} />
          <p className="text-xs text-foreground-subtle">
            목적을 증명하면 항목별로 한도가 열립니다
          </p>
        </Card>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground-muted">바로 하기</p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Card className="flex h-24 flex-col justify-between hover:border-border-strong">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-[15px] font-medium text-foreground">{label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={askAgent}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 text-left"
        >
          <input
            value={question}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") askAgent();
            }}
            placeholder="직접 물어보기"
            className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-foreground-muted"
          />
          <ArrowRight className="h-4 w-4 shrink-0 text-foreground-muted" />
        </button>
      </div>
    </AppShell>
  );
}
