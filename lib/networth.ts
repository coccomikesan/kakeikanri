import type { Account, AccountCategory } from "@/lib/types";
import type { NetWorthPoint } from "@/components/NetWorthChart";

export const ACCOUNT_CATEGORY_LABELS: Record<AccountCategory, string> = {
  LIQUID: "流動資産",
  RESTRICTED: "拘束資産",
};

function latestBalanceAsOf(account: Account, date: string): number | undefined {
  return [...account.snapshots]
    .filter((s) => s.date.slice(0, 10) <= date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1)?.balance;
}

function latestBalance(account: Account): number | undefined {
  return [...account.snapshots].sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.balance;
}

export function computeNetWorthSeries(accounts: Account[]): NetWorthPoint[] {
  const dates = new Set<string>();
  for (const account of accounts) {
    for (const snapshot of account.snapshots) {
      dates.add(snapshot.date.slice(0, 10));
    }
  }
  const sortedDates = [...dates].sort();

  return sortedDates.map((date) => {
    let liquid = 0;
    let restricted = 0;
    for (const account of accounts) {
      const balance = latestBalanceAsOf(account, date) ?? 0;
      if (account.category === "RESTRICTED") {
        restricted += balance;
      } else {
        liquid += balance;
      }
    }
    return { date, liquid, restricted, netWorth: liquid + restricted };
  });
}

export function currentNetWorth(accounts: Account[]): number {
  return accounts.reduce((sum, account) => sum + (latestBalance(account) ?? 0), 0);
}

export function currentBalanceByCategory(accounts: Account[]): {
  liquid: number;
  restricted: number;
  total: number;
} {
  let liquid = 0;
  let restricted = 0;
  for (const account of accounts) {
    const balance = latestBalance(account) ?? 0;
    if (account.category === "RESTRICTED") {
      restricted += balance;
    } else {
      liquid += balance;
    }
  }
  return { liquid, restricted, total: liquid + restricted };
}
