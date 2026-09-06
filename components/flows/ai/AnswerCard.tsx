"use client";

import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AI_ANSWER_CONFIG, AiAnswerKind } from "@/lib/mock/ai-responses";

interface AnswerOption {
  title: string;
  badge?: string;
  amountLine?: string;
  detail: string;
}

interface AnswerContent {
  reminder?: string;
  options: AnswerOption[];
  warning?: string;
  ctaLabel: string;
}

export function AnswerCard({ question, kind }: { question: string; kind: AiAnswerKind }) {
  const { t, tNode } = useTranslation();
  const answer = tNode<AnswerContent>(`ai.answers.${kind}`);
  const { icons, ctaHref } = AI_ANSWER_CONFIG[kind];

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-sm text-foreground-subtle">{t("ai.questionLabel")}</p>
        <p className="text-[19px] font-bold leading-snug text-foreground">{question}</p>
      </div>

      {answer.reminder && (
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-foreground-muted">
          <Clock className="h-4 w-4 shrink-0" /> {answer.reminder}
        </div>
      )}

      <div className="space-y-3">
        {answer.options.map((option, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <Card key={option.title}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-[18px] w-[18px] text-primary" />
                  <span className="text-[15px] font-medium text-foreground">{option.title}</span>
                </div>
                {option.badge && <Badge tone="primary">{option.badge}</Badge>}
              </div>
              {option.amountLine && (
                <p className="mt-2 pl-[26px] text-[15px] font-semibold text-foreground">
                  {option.amountLine}
                </p>
              )}
              <p className="mt-1 pl-[26px] text-sm leading-relaxed text-foreground-muted">
                {option.detail}
              </p>
            </Card>
          );
        })}
      </div>

      {answer.warning && (
        <Card className="flex gap-2.5 bg-warning-muted">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm leading-relaxed text-warning">{answer.warning}</p>
        </Card>
      )}

      <Link href={ctaHref}>
        <Button>{answer.ctaLabel}</Button>
      </Link>
    </div>
  );
}
