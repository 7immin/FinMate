"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SupportInquiry, SupportInquiryCategory } from "@/lib/types";

const CATEGORIES: SupportInquiryCategory[] = ["bug", "usage", "other"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function SupportPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<SupportInquiryCategory>("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inquiries, setInquiries] = useState<SupportInquiry[] | null>(null);

  useEffect(() => {
    fetch("/api/support")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setInquiries(data?.inquiries ?? []));
  }, []);

  async function handleSubmit() {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    setSubmitSuccess(false);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setInquiries((prev) => [data.inquiry, ...(prev ?? [])]);
      setMessage("");
      setSubmitSuccess(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell className="flex flex-col">
      <TopBar title={t("more.support.title")} />
      <div className="space-y-6 px-5 pb-10 pt-2">
        <p className="text-sm text-foreground-muted">{t("more.support.description")}</p>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("more.support.categoryLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {t(`more.support.category.${c}`)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("more.support.messageLabel")}</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("more.support.messagePlaceholder")}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </div>

        {submitSuccess && (
          <p className="text-[13px] text-success">{t("more.support.submitSuccess")}</p>
        )}
        {submitError && <p className="text-[13px] text-danger">{t("more.support.submitError")}</p>}

        <Button onClick={handleSubmit} disabled={!message.trim() || submitting}>
          {submitting ? t("more.support.submitting") : t("more.support.submit")}
        </Button>

        <div>
          <h2 className="text-[15px] font-semibold text-foreground">{t("more.support.historyTitle")}</h2>
          {inquiries === null ? null : inquiries.length === 0 ? (
            <p className="mt-3 text-sm text-foreground-subtle">{t("more.support.emptyHistory")}</p>
          ) : (
            <Card className="mt-3 divide-y divide-border">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="space-y-1.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-foreground-muted">
                      {t(`more.support.category.${inquiry.category}`)} · {formatDate(inquiry.createdAt)}
                    </span>
                    <Badge tone={inquiry.status === "answered" ? "success" : "neutral"}>
                      {t(`more.support.status.${inquiry.status}`)}
                    </Badge>
                  </div>
                  <p className="text-[14px] text-foreground">{inquiry.message}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
