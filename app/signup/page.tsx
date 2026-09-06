"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/layout/AppShell";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data.session) {
      // Email confirmation is required before the session becomes active.
      setNeedsConfirmation(true);
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <AppShell className="flex flex-col justify-center px-6 text-center">
        <h1 className="text-[22px] font-bold text-foreground">이메일을 확인해 주세요</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
          {email}로 인증 메일을 보냈어요. 메일함의 링크를 눌러 인증을 완료한 뒤 로그인해 주세요.
        </p>
        <Link href="/login" className="mt-6 font-medium text-primary">
          로그인 화면으로
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell className="flex flex-col justify-center px-6">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
        F
      </div>
      <h1 className="text-[24px] font-bold text-foreground">회원가입</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        이메일과 비밀번호만으로 FinMate를 시작할 수 있어요.
      </p>

      <form onSubmit={handleSignup} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (6자 이상)"
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "가입 중…" : "회원가입"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-primary">
          로그인
        </Link>
      </p>
    </AppShell>
  );
}
