import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

export function StepCard({
  index,
  title,
  hint,
  description,
  children,
  tone = "neutral",
}: {
  index: number;
  title: string;
  hint?: string;
  description?: string;
  children?: ReactNode;
  tone?: "neutral" | "primary" | "danger";
}) {
  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              tone === "primary" && "bg-primary text-white",
              tone === "danger" && "bg-danger text-white",
              tone === "neutral" && "bg-white/[0.08] text-foreground"
            )}
          >
            {index}
          </span>
          <span className="text-[15px] font-medium text-foreground">{title}</span>
        </div>
        {hint && <span className="text-xs text-foreground-muted">{hint}</span>}
      </div>
      {description && (
        <p className="pl-9 text-sm leading-relaxed text-foreground-muted">{description}</p>
      )}
      {children && <div className="pl-9">{children}</div>}
    </Card>
  );
}
