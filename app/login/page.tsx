"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/layout/AppShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <AppShell className="flex flex-col justify-center px-6">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
        F
      </div>
      <h1 className="text-[24px] font-bold text-foreground">로그인</h1>
      <p className="mt-2 text-sm text-foreground-muted">FinMate 계정으로 로그인하세요.</p>

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "로그인 중…" : "로그인"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-primary">
          회원가입
        </Link>
      </p>
    </AppShell>
  );
}
