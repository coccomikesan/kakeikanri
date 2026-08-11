"use client";

import { useCallback, useEffect, useState } from "react";
import { MonthPicker } from "@/components/MonthPicker";
import { BudgetProgress } from "@/components/BudgetProgress";
import { LoadingCat } from "@/components/LoadingCat";
import { EmptyState } from "@/components/EmptyState";
import { COST_TYPE_LABELS, sortCategoriesForDisplay } from "@/lib/category";
import { currentYearMonth } from "@/lib/format";
import type { Budget, Category, CostType, MonthlyNote, Transaction } from "@/lib/types";

const GROUPS: { key: CostType | "UNSET"; label: string }[] = [
  { key: "VARIABLE", label: COST_TYPE_LABELS.VARIABLE },
  { key: "FIXED", label: COST_TYPE_LABELS.FIXED },
  { key: "UNSET", label: "未分類" },
];

export default function BudgetsPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);
  const [memoDirty, setMemoDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [categoriesRes, budgetsRes, transactionsRes, noteRes] = await Promise.all([
      fetch("/api/categories"),
      fetch(`/api/budgets?yearMonth=${yearMonth}`),
      fetch(`/api/transactions?yearMonth=${yearMonth}`),
      fetch(`/api/monthly-notes?yearMonth=${yearMonth}`),
    ]);
    const [categoriesData, budgetsData, transactionsData, noteData] = await Promise.all([
      categoriesRes.json(),
      budgetsRes.json(),
      transactionsRes.json(),
      noteRes.json() as Promise<MonthlyNote | null>,
    ]);
    setCategories(categoriesData);
    setBudgets(budgetsData);
    setTransactions(transactionsData);
    setInputs(
      Object.fromEntries(
        (budgetsData as Budget[]).map((b) => [b.categoryId, String(b.amount)])
      )
    );
    setMemo(noteData?.memo ?? "");
    setMemoDirty(false);
    setLoading(false);
  }, [yearMonth]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(categoryId: string) {
    const amount = Number(inputs[categoryId]);
    if (!amount || amount <= 0) return;
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, yearMonth, amount }),
    });
    await load();
  }

  async function handleSaveMemo() {
    setMemoSaving(true);
    await fetch("/api/monthly-notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yearMonth, memo }),
    });
    setMemoSaving(false);
    setMemoDirty(false);
  }

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) + t.amount);
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = [...spentByCategory.values()].reduce((s, v) => s + v, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">予算</h1>
        <MonthPicker value={yearMonth} onChange={setYearMonth} />
      </div>

      {!loading && (
        <div className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-4">
          <label className="flex flex-col gap-1 text-sm">
            この月のメモ
            <textarea
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value);
                setMemoDirty(true);
              }}
              placeholder="例: 旦那の収入が今月ないため予算を減らした"
              rows={2}
              className="w-full resize-y rounded-xl border border-border bg-transparent px-3 py-1.5 text-sm"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveMemo}
              disabled={memoSaving || !memoDirty}
              className="self-start rounded-full border border-border px-3 py-1 text-xs hover:bg-accent-soft disabled:opacity-50"
            >
              {memoSaving ? "保存中..." : "メモを保存"}
            </button>
            {!memoDirty && memo && (
              <span className="text-xs text-foreground/50">保存済み</span>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingCat />
      ) : (
        <>
          {totalBudget > 0 && (
            <div className="rounded-3xl border border-border bg-card p-4">
              <BudgetProgress label="全体" budget={totalBudget} spent={totalSpent} />
            </div>
          )}

          {expenseCategories.length === 0 && (
            <EmptyState message="支出カテゴリがありません" />
          )}

          {GROUPS.map((group) => {
            const groupCategories = sortCategoriesForDisplay(
              expenseCategories.filter((c) =>
                group.key === "UNSET" ? !c.costType : c.costType === group.key
              )
            );
            if (groupCategories.length === 0) return null;

            const groupBudget = groupCategories.reduce(
              (s, c) => s + (budgets.find((b) => b.categoryId === c.id)?.amount ?? 0),
              0
            );
            const groupSpent = groupCategories.reduce(
              (s, c) => s + (spentByCategory.get(c.id) ?? 0),
              0
            );

            return (
              <div
                key={group.key}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">{group.label}</h2>
                  {groupBudget > 0 && (
                    <span className="text-xs text-foreground/60">
                      小計 {Math.round((groupSpent / groupBudget) * 100)}%
                    </span>
                  )}
                </div>
                {groupBudget > 0 && (
                  <BudgetProgress label={`${group.label}合計`} budget={groupBudget} spent={groupSpent} />
                )}

                {groupCategories.map((c) => {
                  const budget = budgets.find((b) => b.categoryId === c.id);
                  const spent = spentByCategory.get(c.id) ?? 0;
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col gap-2 border-t border-border pt-4 first:border-0 first:pt-0"
                    >
                      <BudgetProgress label={c.name} budget={budget?.amount ?? 0} spent={spent} />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          placeholder="予算額を入力"
                          value={inputs[c.id] ?? ""}
                          onChange={(e) =>
                            setInputs((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          className="w-36 rounded-xl border border-border bg-transparent px-3 py-1 text-sm"
                        />
                        <button
                          onClick={() => handleSave(c.id)}
                          className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent-soft"
                        >
                          設定する
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
