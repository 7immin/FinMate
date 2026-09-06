import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
}

export function Card({ className, raised, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-4",
        raised ? "bg-surface-raised" : "bg-surface",
        className
      )}
      {...props}
    />
  );
}
