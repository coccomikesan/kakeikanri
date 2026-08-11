import { formatCurrency } from "@/lib/format";

type Props = {
  label: string;
  budget: number;
  spent: number;
};

export function BudgetProgress({ label, budget, spent }: Props) {
  const ratio = budget > 0 ? spent / budget : 0;
  const percent = Math.min(ratio, 1) * 100;
  const over = ratio > 1;
  const warn = ratio >= 0.8 && ratio <= 1;

  const barColor = over
    ? "bg-red-500"
    : warn
      ? "bg-amber-500"
      : "bg-green-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className={over ? "font-semibold text-red-600 dark:text-red-400" : "text-foreground/70"}>
          {formatCurrency(spent)} / {formatCurrency(budget)}
          {budget > 0 && ` (${Math.round(ratio * 100)}%)`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-accent-soft">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
      {over && (
        <p className="text-xs text-red-600 dark:text-red-400">
          予算を {formatCurrency(spent - budget)} 超過しています
        </p>
      )}
    </div>
  );
}
