export type CategoryType = "INCOME" | "EXPENSE";
export type CostType = "FIXED" | "VARIABLE";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
  costType: CostType | null;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: CategoryType;
  categoryId: string;
  category: Category;
  memo: string | null;
  settled: boolean;
  createdAt: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  category: Category;
  yearMonth: string;
  amount: number;
};

export type MonthlyNote = {
  id: string;
  yearMonth: string;
  memo: string;
  updatedAt: string;
};

export type AssetSnapshot = {
  id: string;
  accountId: string;
  date: string;
  balance: number;
};

export type AccountCategory = "LIQUID" | "RESTRICTED";

export type Account = {
  id: string;
  name: string;
  category: AccountCategory;
  snapshots: AssetSnapshot[];
};
