"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BRANCHES, Branch } from "@/lib/mock/account";

export function BranchFinderStep({ onSelect }: { onSelect: (branch: Branch) => void }) {
  const nearest = BRANCHES[0];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="외국인 전용 창구" />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div className="relative h-40 overflow-hidden rounded-2xl border border-border bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:24px_24px] bg-surface">
          <span className="absolute right-3 top-3 text-xs text-foreground-subtle">성동구</span>
          <span className="absolute left-[38%] top-[55%] h-3 w-3 rounded-full bg-primary ring-4 ring-primary/25" />
          <span className="absolute left-[62%] top-[28%] h-2 w-2 rounded-full bg-white/40" />
          <span className="absolute left-[70%] top-[70%] h-2 w-2 rounded-full bg-white/40" />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground-muted">가까운 3곳</p>
          <span className="text-xs text-foreground-subtle">영어 상담 가능만</span>
        </div>

        <div className="space-y-3">
          {BRANCHES.map((branch) => (
            <Card key={branch.id}>
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-foreground">{branch.name}</span>
                <span className="text-sm text-foreground-muted">{branch.distance}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {branch.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-foreground-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {branch.hours && (
                <p className="mt-2 text-xs text-foreground-subtle">{branch.hours}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={() => onSelect(nearest)}>{nearest.name} 방문 준비</Button>
      </div>
    </div>
  );
}
