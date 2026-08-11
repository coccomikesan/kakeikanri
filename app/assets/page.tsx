"use client";

import { useEffect, useState } from "react";
import { NetWorthChart } from "@/components/NetWorthChart";
import { LoadingCat } from "@/components/LoadingCat";
import { EmptyState } from "@/components/EmptyState";
import { ACCOUNT_CATEGORY_LABELS, computeNetWorthSeries, currentBalanceByCategory } from "@/lib/networth";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Account, AccountCategory } from "@/lib/types";

export default function AssetsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountCategory, setNewAccountCategory] = useState<AccountCategory>("LIQUID");
  const [snapshotInputs, setSnapshotInputs] = useState<Record<string, { date: string; balance: string }>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/accounts");
    setAccounts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newAccountName.trim(), category: newAccountCategory }),
    });
    setNewAccountName("");
    setNewAccountCategory("LIQUID");
    await load();
  }

  async function handleChangeCategory(accountId: string, category: AccountCategory) {
    await fetch(`/api/accounts/${accountId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    await load();
  }

  async function handleDeleteAccount(id: string) {
    if (!confirm("この口座と残高記録をすべて削除しますか？")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleAddSnapshot(accountId: string) {
    const input = snapshotInputs[accountId];
    if (!input?.date || !input.balance) return;
    await fetch(`/api/accounts/${accountId}/snapshots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: input.date, balance: Number(input.balance) }),
    });
    setSnapshotInputs((prev) => ({ ...prev, [accountId]: { date: input.date, balance: "" } }));
    await load();
  }

  async function handleDeleteSnapshot(id: string) {
    await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
    await load();
  }

  const netWorthSeries = computeNetWorthSeries(accounts);
  const { liquid, restricted, total } = currentBalanceByCategory(accounts);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">資産</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/60">今使えるお金（流動資産）</p>
          <p className="text-2xl font-semibold tabular-nums">{formatCurrency(liquid)}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/60">拘束資産（iDeCoなど）</p>
          <p className="text-2xl font-semibold tabular-nums text-foreground/70">
            {formatCurrency(restricted)}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/60">純資産合計</p>
          <p className="text-2xl font-semibold tabular-nums">{formatCurrency(total)}</p>
        </div>
      </div>

      {!loading && (
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-medium">純資産の推移</p>
          <NetWorthChart data={netWorthSeries} />
        </div>
      )}

      <form
        onSubmit={handleAddAccount}
        className="flex flex-wrap items-end gap-3 rounded-3xl border border-border bg-card p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          口座を追加
          <input
            type="text"
            required
            placeholder="例: 普通預金"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            className="rounded-xl border border-border bg-transparent px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          区分
          <select
            value={newAccountCategory}
            onChange={(e) => setNewAccountCategory(e.target.value as AccountCategory)}
            className="rounded-xl border border-border bg-transparent px-3 py-1.5"
          >
            <option value="LIQUID">流動資産（いつでも使える）</option>
            <option value="RESTRICTED">拘束資産（iDeCoなど、今は引き出せない）</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground"
        >
          追加する
        </button>
      </form>

      {loading ? (
        <LoadingCat />
      ) : accounts.length === 0 ? (
        <EmptyState message="口座がまだありません" />
      ) : (
        <div className="flex flex-col gap-4">
          {accounts.map((account) => {
            const input = snapshotInputs[account.id] ?? { date: today, balance: "" };
            const latestBalance = [...account.snapshots]
              .sort((a, b) => a.date.localeCompare(b.date))
              .at(-1)?.balance;
            return (
              <div key={account.id} className="rounded-3xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium">{account.name}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          account.category === "RESTRICTED"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        }`}
                      >
                        {ACCOUNT_CATEGORY_LABELS[account.category]}
                      </span>
                    </div>
                    {latestBalance !== undefined && (
                      <p className="text-sm text-foreground/60">
                        最新残高: {formatCurrency(latestBalance)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    口座を削除
                  </button>
                </div>

                <div className="mb-3 flex flex-wrap items-end gap-2">
                  <label className="flex flex-col gap-1 text-sm">
                    区分
                    <select
                      value={account.category}
                      onChange={(e) =>
                        handleChangeCategory(account.id, e.target.value as AccountCategory)
                      }
                      className="rounded-xl border border-border bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="LIQUID">流動資産</option>
                      <option value="RESTRICTED">拘束資産</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    日付
                    <input
                      type="date"
                      value={input.date}
                      onChange={(e) =>
                        setSnapshotInputs((prev) => ({
                          ...prev,
                          [account.id]: { ...input, date: e.target.value },
                        }))
                      }
                      className="rounded-xl border border-border bg-transparent px-3 py-1 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    残高
                    <input
                      type="number"
                      placeholder="0"
                      value={input.balance}
                      onChange={(e) =>
                        setSnapshotInputs((prev) => ({
                          ...prev,
                          [account.id]: { ...input, balance: e.target.value },
                        }))
                      }
                      className="w-32 rounded-xl border border-border bg-transparent px-3 py-1 text-sm"
                    />
                  </label>
                  <button
                    onClick={() => handleAddSnapshot(account.id)}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent-soft"
                  >
                    記録する
                  </button>
                </div>

                {account.snapshots.length > 0 && (
                  <ul className="flex flex-col gap-1 text-sm">
                    {[...account.snapshots]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((s) => (
                        <li key={s.id} className="flex items-center justify-between text-foreground/70">
                          <span>
                            {formatDate(s.date)} — {formatCurrency(s.balance)}
                          </span>
                          <button
                            onClick={() => handleDeleteSnapshot(s.id)}
                            className="text-xs text-red-600 hover:underline dark:text-red-400"
                          >
                            削除
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
