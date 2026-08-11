import type { Category, CostType } from "@/lib/types";

export const COST_TYPE_LABELS: Record<CostType, string> = {
  FIXED: "固定費",
  VARIABLE: "変動費",
};

const COST_TYPE_RANK: Record<CostType, number> = {
  VARIABLE: 0,
  FIXED: 1,
};

const PINNED_FIRST: Partial<Record<CostType, string>> = {
  VARIABLE: "食費",
};

/**
 * Orders categories: variable-cost first (with 食費 pinned to the very top),
 * then fixed-cost, then unclassified — alphabetical order is preserved within
 * each group since the incoming list is already alphabetically sorted by the API.
 */
export function sortCategoriesForDisplay(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const rankA = a.costType ? COST_TYPE_RANK[a.costType] : 2;
    const rankB = b.costType ? COST_TYPE_RANK[b.costType] : 2;
    if (rankA !== rankB) return rankA - rankB;

    const pinned = a.costType ? PINNED_FIRST[a.costType] : undefined;
    if (pinned) {
      if (a.name === pinned && b.name !== pinned) return -1;
      if (b.name === pinned && a.name !== pinned) return 1;
    }
    return 0;
  });
}
