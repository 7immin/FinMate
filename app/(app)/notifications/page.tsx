"use client";

import { useEffect } from "react";
import { CheckCircle2, Bell } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AppNotification } from "@/lib/types";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export default function NotificationsPage() {
  const { state, markNotificationsRead } = useAppState();
  const { t } = useTranslation();
  const notifications = state.notifications;

  // 목록을 열어 본 것 자체가 확인했다는 뜻이다 -- 여기서 바로 배지를 지운다.
  // 목록 자체는 앱이 뜰 때 이미 같이 실어 둔 state.notifications를 그대로
  // 쓴다 -- 여기서 다시 불러오면 이 화면을 열 때마다 빈 화면이 잠깐
  // 보였다가 채워지는 지연이 생긴다.
  useEffect(() => {
    markNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function message(n: AppNotification): string {
    if (n.type === "limit_approved") {
      return t("notifications.limitApproved", {
        purpose: t(`passport.report.category.${n.payload.purpose}`),
        amount: (n.payload.amount ?? 0).toLocaleString(),
      });
    }
    return "";
  }

  return (
    <AppShell className="flex flex-col">
      <TopBar title={t("notifications.title")} />
      <div className="flex-1 space-y-3 px-5 pb-6 pt-2">
        {notifications.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-foreground-muted">
              <Bell className="h-5 w-5" />
            </span>
            <p className="text-sm text-foreground-muted">{t("notifications.empty")}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-relaxed text-foreground">{message(n)}</p>
                <p className="mt-1 text-xs text-foreground-subtle">{formatWhen(n.createdAt)}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
