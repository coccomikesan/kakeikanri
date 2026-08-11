"use client";

type Props = {
  value: string;
  onChange: (yearMonth: string) => void;
};

function shiftMonth(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent-soft"
        aria-label="前月"
      >
        ←
      </button>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm"
      />
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent-soft"
        aria-label="翌月"
      >
        →
      </button>
    </div>
  );
}
