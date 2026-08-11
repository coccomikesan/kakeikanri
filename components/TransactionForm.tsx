"use client";

import { useEffect, useState } from "react";
import type { Category, CategoryType, Transaction } from "@/lib/types";
import { toDateInputValue } from "@/lib/format";
import { sortCategoriesForDisplay } from "@/lib/category";

type FormValues = {
  date: string;
  amount: string;
  type: CategoryType;
  categoryId: string;
  memo: string;
};

function emptyValues(defaultDate: string): FormValues {
  return { date: defaultDate, amount: "", type: "EXPENSE", categoryId: "", memo: "" };
}

type Props = {
  categories: Category[];
  editingTransaction: Transaction | null;
  defaultDate: string;
  onSubmit: (values: {
    date: string;
    amount: number;
    type: CategoryType;
    categoryId: string;
    memo: string;
  }) => Promise<void>;
  onCancelEdit: () => void;
};

export function TransactionForm({
  categories,
  editingTransaction,
  defaultDate,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [values, setValues] = useState<FormValues>(emptyValues(defaultDate));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setValues({
        date: toDateInputValue(editingTransaction.date),
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        categoryId: editingTransaction.categoryId,
        memo: editingTransaction.memo ?? "",
      });
    } else {
      setValues(emptyValues(defaultDate));
    }
  }, [editingTransaction, defaultDate]);

  const filteredCategories = sortCategoriesForDisplay(
    categories.filter((c) => c.type === values.type)
  );

  useEffect(() => {
    if (
      filteredCategories.length > 0 &&
      !filteredCategories.some((c) => c.id === values.categoryId)
    ) {
      setValues((v) => ({ ...v, categoryId: filteredCategories[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.type, categories, values.categoryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = Number(values.amount);
    if (!values.date || !amount || amount <= 0 || !values.categoryId) {
      setError("日付・金額・カテゴリを正しく入力してください");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        date: values.date,
        amount,
        type: values.type,
        categoryId: values.categoryId,
        memo: values.memo,
      });
      if (!editingTransaction) {
        setValues(emptyValues(defaultDate));
      }
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          種別
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(["EXPENSE", "INCOME"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValues((v) => ({ ...v, type: t }))}
                className={`px-3 py-1.5 text-sm ${
                  values.type === t
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent-soft"
                }`}
              >
                {t === "EXPENSE" ? "支出" : "収入"}
              </button>
            ))}
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          日付
          <input
            type="date"
            required
            value={values.date}
            onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
            className="rounded-xl border border-border bg-transparent px-3 py-1.5"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          金額
          <input
            type="number"
            required
            min={1}
            placeholder="0"
            value={values.amount}
            onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
            className="w-32 rounded-xl border border-border bg-transparent px-3 py-1.5"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          カテゴリ
          <select
            required
            value={values.categoryId}
            onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value }))}
            className="rounded-xl border border-border bg-transparent px-3 py-1.5"
          >
            {filteredCategories.length === 0 && <option value="">カテゴリがありません</option>}
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 min-w-[10rem] flex-col gap-1 text-sm">
          メモ
          <input
            type="text"
            placeholder="任意"
            value={values.memo}
            onChange={(e) => setValues((v) => ({ ...v, memo: e.target.value }))}
            className="rounded-xl border border-border bg-transparent px-3 py-1.5"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground disabled:opacity-50"
        >
          {editingTransaction ? "更新する" : "追加する"}
        </button>
        {editingTransaction && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-full border border-border px-4 py-1.5 text-sm"
          >
            編集をキャンセル
          </button>
        )}
      </div>
    </form>
  );
}
