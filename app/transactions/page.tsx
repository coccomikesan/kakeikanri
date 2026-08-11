"use client";

import { useCallback, useEffect, useState } from "react";
import { MonthPicker } from "@/components/MonthPicker";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import { LoadingCat } from "@/components/LoadingCat";
import { currentYearMonth, formatCurrency } from "@/lib/format";
import type { Category, CategoryType, Transaction } from "@/lib/types";

type SettledFilter = "ALL" | "SETTLED" | "UNSETTLED";

export default function TransactionsPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [settledFilter, setSettledFilter] = useState<SettledFilter>("ALL");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ yearMonth });
    if (settledFilter !== "ALL") {
      params.set("settled", settledFilter === "SETTLED" ? "true" : "false");
    }
    const res = await fetch(`/api/transactions?${params.toString()}`);
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }, [yearMonth, settledFilter]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handleSubmit(values: {
    date: string;
    amount: number;
    type: CategoryType;
    categoryId: string;
    memo: string;
  }) {
    if (editingTransaction) {
      await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setEditingTransaction(null);
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    }
    await loadTransactions();
  }

  async function handleDelete(id: string) {
    if (!confirm("この取引を削除しますか？")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (editingTransaction?.id === id) setEditingTransaction(null);
    await loadTransactions();
  }

  async function handleToggleSettled(id: string, settled: boolean) {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, settled } : t)));
    await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settled }),
    });
    await loadTransactions();
  }

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">取引</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-border overflow-hidden text-sm">
            {(
              [
                ["ALL", "すべて"],
                ["SETTLED", "精算済み"],
                ["UNSETTLED", "未精算"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSettledFilter(value)}
                className={`px-3 py-1.5 ${
                  settledFilter === value
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <MonthPicker value={yearMonth} onChange={setYearMonth} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="rounded-2xl border border-border bg-card px-4 py-2">
          収入合計: <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(income)}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-2">
          支出合計: <span className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(expense)}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-2">
          収支: <span className="font-semibold">{formatCurrency(income - expense)}</span>
        </div>
      </div>

      <TransactionForm
        categories={categories}
        editingTransaction={editingTransaction}
        defaultDate={new Date().toISOString().slice(0, 10)}
        onSubmit={handleSubmit}
        onCancelEdit={() => setEditingTransaction(null)}
      />

      {loading ? (
        <LoadingCat />
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={setEditingTransaction}
          onDelete={handleDelete}
          onToggleSettled={handleToggleSettled}
        />
      )}
    </div>
  );
}
