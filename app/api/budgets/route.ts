import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = await getPrisma();
  const searchParams = request.nextUrl.searchParams;
  const yearMonth = searchParams.get("yearMonth");

  const budgets = await prisma.budget.findMany({
    where: yearMonth ? { yearMonth } : undefined,
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });
  return Response.json(budgets);
}

export async function POST(request: NextRequest) {
  const prisma = await getPrisma();
  const body = await request.json();
  const { categoryId, yearMonth, amount } = body;

  if (!categoryId || !yearMonth || amount === undefined) {
    return Response.json(
      { error: "categoryId, yearMonth, amount は必須です" },
      { status: 400 }
    );
  }

  const budget = await prisma.budget.upsert({
    where: { categoryId_yearMonth: { categoryId, yearMonth } },
    update: { amount: Math.round(Number(amount)) },
    create: { categoryId, yearMonth, amount: Math.round(Number(amount)) },
    include: { category: true },
  });
  return Response.json(budget, { status: 201 });
}
