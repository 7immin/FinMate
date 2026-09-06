import { Check, AlertTriangle } from "lucide-react";
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
        "flex w-full items-start gap-3 rounded-xl px-1 py-2.5 text-left",
        onClick && "hover:bg-white/[0.03]",
        className
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          status === "done" && "border-primary bg-primary",
          status === "warning" && "border-warning bg-warning",
          status === "active" && "border-foreground-muted",
          status === "pending" && "border-white/[0.12]"
        )}
      >
        {status === "done" && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        {status === "warning" && (
          <AlertTriangle className="h-3 w-3 text-white" strokeWidth={2.5} />
        )}
      </span>
      {/*
        라벨과 힌트를 좌우로 나란히 두면 안 된다. 힌트가 길면 그쪽이
        min-content까지만 줄어들면서 라벨 칸을 0에 가깝게 밀어내고, 한국어는
        아무 데서나 줄바꿈되므로 라벨이 한 글자씩 세로로 쌓인다.

        위아래로 쌓으면 어느 쪽이 길든 각자 한 줄을 온전히 쓴다. min-w-0은
        flex 안에서 이 칸이 min-content 밑으로도 줄어들 수 있게 해 준다 —
        없으면 긴 문장이 부모를 밀어내 가로 스크롤이 생긴다.
      */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-[15px] leading-snug",
            status === "pending" ? "text-foreground-subtle" : "text-foreground"
          )}
        >
          {label}
        </span>
        {hint && (
          <span
            className={cn(
              "text-sm leading-snug",
              status === "warning" ? "text-warning" : "text-foreground-muted"
            )}
          >
            {hint}
          </span>
        )}
      </span>
    </Wrapper>
  );
}
