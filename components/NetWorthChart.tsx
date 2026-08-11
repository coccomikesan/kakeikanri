"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export type NetWorthPoint = {
  date: string;
  liquid: number;
  restricted: number;
  netWorth: number;
};

const SERIES = [
  { key: "liquid" as const, label: "流動資産", color: "var(--chart-line)", fill: "var(--chart-fill)" },
  {
    key: "restricted" as const,
    label: "拘束資産",
    color: "var(--chart-series-2)",
    fill: "var(--chart-series-2-fill)",
  },
];

function compactYen(value: number): string {
  if (Math.abs(value) >= 10000) return `${Math.round(value / 10000)}万`;
  return String(value);
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: NetWorthPoint }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div
      className="rounded-2xl border px-3 py-2 text-sm shadow-sm"
      style={{
        background: "var(--chart-tooltip-bg)",
        borderColor: "var(--chart-tooltip-border)",
        color: "var(--foreground)",
      }}
    >
      <div className="mb-1 text-xs" style={{ color: "var(--chart-muted)" }}>
        {formatDate(point.date)}
      </div>
      {SERIES.map((s) => (
        <div key={s.key} className="flex items-center justify-between gap-4 tabular-nums">
          <span className="flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
          <span>{formatCurrency(point[s.key])}</span>
        </div>
      ))}
      <div
        className="mt-1 flex items-center justify-between gap-4 border-t pt-1 font-semibold tabular-nums"
        style={{ borderColor: "var(--chart-tooltip-border)" }}
      >
        <span>合計</span>
        <span>{formatCurrency(point.netWorth)}</span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-2 flex gap-4 text-xs" style={{ color: "var(--chart-muted)" }}>
      {SERIES.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  if (data.length === 0) {
    return <EmptyState message="資産推移を表示するには、口座の残高を記録してください" />;
  }

  const hasRestricted = data.some((d) => d.restricted > 0);

  return (
    <div>
      {hasRestricted && <Legend />}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="liquidFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-fill)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-fill)" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="restrictedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-series-2-fill)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-series-2-fill)" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => formatDate(v)}
              tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--chart-grid)" }}
              tickLine={false}
              minTickGap={32}
            />
            <YAxis
              tickFormatter={compactYen}
              tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="liquid"
              stackId="netWorth"
              name="流動資産"
              stroke="var(--chart-line)"
              strokeWidth={2}
              fill="url(#liquidFill)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--chart-line)", stroke: "var(--chart-surface)", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="restricted"
              stackId="netWorth"
              name="拘束資産"
              stroke="var(--chart-series-2)"
              strokeWidth={2}
              fill="url(#restrictedFill)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--chart-series-2)",
                stroke: "var(--chart-surface)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
