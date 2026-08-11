"use client";

import { useEffect, useState } from "react";
import { COST_TYPE_LABELS } from "@/lib/category";
import { LoadingCat } from "@/components/LoadingCat";
import type { Category, CategoryType, CostType } from "@/lib/types";

const DEFAULT_COLOR = "#6b7280";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [costType, setCostType] = useState<CostType | "">("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        type,
        color,
        costType: type === "EXPENSE" && costType ? costType : null,
      }),
    });
    setName("");
    setColor(DEFAULT_COLOR);
    setCostType("");
    await load();
  }

  async function handleChangeCostType(id: string, next: CostType | "") {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ costType: next || null }),
    });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("このカテゴリを削除しますか？")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "削除に失敗しました");
      return;
    }
    await load();
  }

  const income = categories.filter((c) => c.type === "INCOME");
  const expense = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">カテゴリ</h1>

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-3 rounded-3xl border border-border bg-card p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          名前
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-border bg-transparent px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          種別
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            className="rounded-xl border border-border bg-transparent px-3 py-1.5"
          >
            <option value="EXPENSE">支出</option>
            <option value="INCOME">収入</option>
          </select>
        </label>
        {type === "EXPENSE" && (
          <label className="flex flex-col gap-1 text-sm">
            費用区分
            <select
              value={costType}
              onChange={(e) => setCostType(e.target.value as CostType | "")}
              className="rounded-xl border border-border bg-transparent px-3 py-1.5"
            >
              <option value="">未分類</option>
              <option value="FIXED">固定費</option>
              <option value="VARIABLE">変動費</option>
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          色
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-14 rounded-xl border border-border bg-transparent"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground"
        >
          追加する
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <LoadingCat />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <CategoryList title="収入カテゴリ" items={income} onDelete={handleDelete} />
          <CategoryList
            title="支出カテゴリ"
            items={expense}
            onDelete={handleDelete}
            onChangeCostType={handleChangeCostType}
          />
        </div>
      )}
    </div>
  );
}

function CategoryList({
  title,
  items,
  onDelete,
  onChangeCostType,
}: {
  title: string;
  items: Category[];
  onDelete: (id: string) => void;
  onChangeCostType?: (id: string, costType: CostType | "") => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <h2 className="mb-3 font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-foreground/60">カテゴリがありません</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color ?? "#6b7280" }}
                />
                {c.name}
              </span>
              <span className="flex items-center gap-2">
                {onChangeCostType && (
                  <select
                    value={c.costType ?? ""}
                    onChange={(e) =>
                      onChangeCostType(c.id, e.target.value as CostType | "")
                    }
                    className="rounded-full border border-border bg-transparent px-2 py-0.5 text-xs"
                  >
                    <option value="">未分類</option>
                    <option value="FIXED">{COST_TYPE_LABELS.FIXED}</option>
                    <option value="VARIABLE">{COST_TYPE_LABELS.VARIABLE}</option>
                  </select>
                )}
                <button
                  onClick={() => onDelete(c.id)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  削除
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
