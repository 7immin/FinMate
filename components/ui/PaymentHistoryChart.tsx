import { PaymentRecord } from "@/lib/types";

const HEIGHT_SEED = [62, 78, 46, 70, 58, 88, 66, 94];

export function PaymentHistoryChart({ records }: { records: PaymentRecord[] }) {
  const onTimeCount = records.filter((r) => r.onTime).length;
  const overdueCount = records.length - onTimeCount;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">납부 기록</span>
        <span className="text-xs text-foreground-muted">
          정시 {onTimeCount} · 연체 {overdueCount}
        </span>
      </div>
      <div className="flex h-24 items-end gap-2" role="img" aria-label="월별 납부 기록 막대그래프">
        {records.map((record, idx) => {
          const height = HEIGHT_SEED[idx % HEIGHT_SEED.length];
          return (
            <div
              key={`${record.month}-${idx}`}
              title={`${record.month} · ${record.onTime ? "정시 납부" : "연체"}`}
              className="relative flex-1 rounded-t-md bg-primary"
              style={{ height: `${height}%` }}
            >
              {!record.onTime && (
                <div
                  className="absolute inset-0 rounded-t-md bg-[repeating-linear-gradient(135deg,rgba(245,166,35,0.55)_0px,rgba(245,166,35,0.55)_3px,transparent_3px,transparent_7px)] ring-1 ring-inset ring-warning/70"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-foreground-subtle">
        <span>{records[0]?.month}</span>
        <span>{records[records.length - 1]?.month}</span>
      </div>
    </div>
  );
}
