import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ChecklistStatus = "done" | "active" | "pending" | "warning";

export function ChecklistRow({
  status,
  label,
  hint,
  onClick,
  className,
}: {
  status: ChecklistStatus;
  label: string;
  hint?: string;
  onClick?: () => void;
  className?: string;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-left",
        onClick && "hover:bg-white/[0.03]",
        className
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          status === "done" && "border-primary bg-primary",
          status === "warning" && "border-warning bg-warning",
          status === "active" && "border-foreground-muted",
          status === "pending" && "border-white/[0.12]"
        )}
      >
        {(status === "done" || status === "warning") && (
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        )}
      </span>
      <span
        className={cn(
          "flex-1 text-[15px]",
          status === "pending" ? "text-foreground-subtle" : "text-foreground"
        )}
      >
        {label}
      </span>
      {hint && (
        <span
          className={cn(
            "text-sm",
            status === "warning" ? "text-warning" : "text-foreground-muted"
          )}
        >
          {hint}
        </span>
      )}
    </Wrapper>
  );
}
