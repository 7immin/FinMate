import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary/15 text-white"
          : "border-border text-foreground-muted hover:border-border-strong",
        className
      )}
      {...props}
    />
  );
}
