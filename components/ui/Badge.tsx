import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-muted text-primary",
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
  neutral: "bg-white/[0.06] text-foreground-muted",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
