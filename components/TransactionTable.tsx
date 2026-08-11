"use client";

import type { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

type Props = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleSettled: (id: string, settled: boolean) => void;
};

export function TransactionTable({ transactions, onEdit, onDelete, onToggleSettled }: Props) {
  if (transactions.length === 0) {
    return <EmptyState message="この月の取引はまだありません" />;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-accent-soft text-left">
          <tr>
            <th className="px-3 py-2 font-medium">日付</th>
            <th className="px-3 py-2 font-medium">種別</th>
            <th className="px-3 py-2 font-medium">カテゴリ</th>
            <th className="px-3 py-2 text-right font-medium">金額</th>
            <th className="px-3 py-2 font-medium">メモ</th>
            <th className="px-3 py-2 text-center font-medium">精算済み</th>
            <th className="px-3 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="px-3 py-2 whitespace-nowrap">{formatDate(t.date)}</td>
              <td className="px-3 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    t.type === "INCOME"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                  }`}
                >
                  {t.type === "INCOME" ? "収入" : "支出"}
                </span>
              </td>
              <td className="px-3 py-2">{t.category.name}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                {formatCurrency(t.amount)}
              </td>
              <td className="px-3 py-2 text-foreground/70">{t.memo}</td>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={t.settled}
                  onChange={(e) => onToggleSettled(t.id, e.target.checked)}
                  aria-label="精算済み"
                  className="size-4 accent-accent"
                />
              </td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(t)}
                  className="mr-2 text-xs text-accent hover:underline"
                >
                  編集
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
