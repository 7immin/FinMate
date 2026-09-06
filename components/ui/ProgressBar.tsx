import { cn } from "@/lib/utils/cn";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function SegmentedProgress({
  segments,
  active,
  className,
}: {
  segments: number;
  active: number;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1.5", className)}>
      {Array.from({ length: segments }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            idx < active ? "bg-primary" : "bg-white/[0.08]"
          )}
        />
      ))}
    </div>
  );
}
