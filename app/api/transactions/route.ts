import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { yearMonthRange } from "@/lib/format";

export async function GET(request: NextRequest) {
  const prisma = await getPrisma();
  const searchParams = request.nextUrl.searchParams;
  const yearMonth = searchParams.get("yearMonth");
  const categoryId = searchParams.get("categoryId");
  const settled = searchParams.get("settled");

  const where: Record<string, unknown> = {};
  if (yearMonth) {
    const { start, end } = yearMonthRange(yearMonth);
    where.date = { gte: start, lt: end };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (settled === "true" || settled === "false") {
    where.settled = settled === "true";
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });
  return Response.json(transactions);
}

export async function POST(request: NextRequest) {
  const prisma = await getPrisma();
  const body = await request.json();
  const { date, amount, type, categoryId, memo, settled } = body;

  if (!date || !amount || (type !== "INCOME" && type !== "EXPENSE") || !categoryId) {
    return Response.json(
      { error: "date, amount, type(INCOME/EXPENSE), categoryId は必須です" },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      date: new Date(date),
      amount: Math.round(Number(amount)),
      type,
      categoryId,
      memo: memo || null,
      settled: settled === true,
    },
    include: { category: true },
  });
  return Response.json(transaction, { status: 201 });
}
