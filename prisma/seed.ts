import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

type CategorySeed = {
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  costType?: "FIXED" | "VARIABLE";
};

const DEFAULT_CATEGORIES: CategorySeed[] = [
  { name: "給与", type: "INCOME", color: "#2563eb" },
  { name: "副収入", type: "INCOME", color: "#0891b2" },
  { name: "こども手当", type: "INCOME", color: "#0d9488" },

  { name: "住宅ローン", type: "EXPENSE", color: "#ea580c", costType: "FIXED" },
  { name: "通信費", type: "EXPENSE", color: "#059669", costType: "FIXED" },
  { name: "水道光熱費", type: "EXPENSE", color: "#d97706", costType: "FIXED" },
  { name: "ガソリン高速費", type: "EXPENSE", color: "#65a30d", costType: "FIXED" },
  { name: "給食バス", type: "EXPENSE", color: "#0891b2", costType: "FIXED" },
  { name: "こづかい", type: "EXPENSE", color: "#7c3aed", costType: "FIXED" },
  { name: "サブスク", type: "EXPENSE", color: "#9333ea", costType: "FIXED" },
  { name: "塾", type: "EXPENSE", color: "#2563eb", costType: "FIXED" },
  { name: "NISA・iDeCo", type: "EXPENSE", color: "#0284c7", costType: "FIXED" },
  { name: "食費", type: "EXPENSE", color: "#dc2626", costType: "VARIABLE" },
  { name: "日用品", type: "EXPENSE", color: "#16a34a", costType: "VARIABLE" },
  { name: "衣服・娯楽・美容・医療", type: "EXPENSE", color: "#db2777", costType: "VARIABLE" },
  { name: "特別費", type: "EXPENSE", color: "#ca8a04", costType: "FIXED" },
  { name: "その他", type: "EXPENSE", color: "#6b7280", costType: "FIXED" },
  { name: "さやか", type: "EXPENSE", color: "#f43f5e" },
];

async function main() {
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name, type: category.type },
    });
    if (!existing) {
      await prisma.category.create({
        data: { ...category, costType: category.costType ?? null },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
