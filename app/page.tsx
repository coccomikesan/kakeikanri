"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NetWorthChart } from "@/components/NetWorthChart";
import { BudgetProgress } from "@/components/BudgetProgress";
import { LoadingCat } from "@/components/LoadingCat";
import { computeNetWorthSeries, currentBalanceByCategory } from "@/lib/networth";
import { currentYearMonth, formatCurrency, yearMonthLabel } from "@/lib/format";
import type { Account, Budget, Transaction } from "@/lib/types";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const yearMonth = currentYearMonth();

  useEffect(() => {
    async function load() {
      const [transactionsRes, budgetsRes, accountsRes] = await Promise.all([
        fetch(`/api/transactions?yearMonth=${yearMonth}`),
        fetch(`/api/budgets?yearMonth=${yearMonth}`),
        fetch("/api/accounts"),
      ]);
      setTransactions(await transactionsRes.json());
      setBudgets(await budgetsRes.json());
      setAccounts(await accountsRes.json());
      setLoading(false);
    }
    load();
  }, [yearMonth]);

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) + t.amount);
  }
  const overBudget = budgets.filter((b) => (spentByCategory.get(b.categoryId) ?? 0) > b.amount);
  const nearBudget = budgets.filter((b) => {
    const spent = spentByCategory.get(b.categoryId) ?? 0;
    return spent <= b.amount && spent / b.amount >= 0.8;
  });

  const netWorthSeries = computeNetWorthSeries(accounts);
  const { liquid, restricted } = currentBalanceByCategory(accounts);

  if (loading) {
    return <LoadingCat />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">ダッシュボード — {yearMonthLabel(yearMonth)}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/60">今月の収入</p>
          <p className="text-2xl font-semibold tabular-nums text-green-600 dark:text-green-400">
            {formatCurrency(income)}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/60">今月の支出</p>
          <p className="text-2xl font-semibold tabular-nums text-orange-600 dark:text-orange-400">
            {formatCurrency(expense)}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/60">今月の収支</p>
          <p className="text-2xl font-semibold tabular-nums">{formatCurrency(income - expense)}</p>
        </div>
      </div>

      {(overBudget.length > 0 || nearBudget.length > 0) && (
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
          <p className="text-sm font-medium">予算アラート</p>
          {overBudget.map((b) => (
            <BudgetProgress
              key={b.id}
              label={b.category.name}
              budget={b.amount}
              spent={spentByCategory.get(b.categoryId) ?? 0}
            />
          ))}
          {nearBudget.map((b) => (
            <BudgetProgress
              key={b.id}
              label={b.category.name}
              budget={b.amount}
              spent={spentByCategory.get(b.categoryId) ?? 0}
            />
          ))}
          <Link href="/budgets" className="text-xs text-accent hover:underline">
            予算ページで詳細を見る →
          </Link>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-sm text-foreground/60">今使えるお金</p>
            <p className="text-3xl font-semibold tabular-nums">{formatCurrency(liquid)}</p>
            {restricted > 0 && (
              <p className="mt-1 text-xs text-foreground/50">
                この他に拘束資産（iDeCoなど）が {formatCurrency(restricted)} あります
              </p>
            )}
          </div>
          <Link href="/assets" className="text-xs text-accent hover:underline">
            資産ページへ →
          </Link>
        </div>
        <NetWorthChart data={netWorthSeries} />
      </div>

      <div className="flex gap-3 text-sm">
        <Link
          href="/transactions"
          className="rounded-full border border-border bg-card px-4 py-1.5 hover:bg-accent-soft"
        >
          取引を記録する
        </Link>
        <Link
          href="/budgets"
          className="rounded-full border border-border bg-card px-4 py-1.5 hover:bg-accent-soft"
        >
          予算を設定する
        </Link>
      </div>
    </div>
  );
}
