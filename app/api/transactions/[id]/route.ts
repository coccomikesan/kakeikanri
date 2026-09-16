import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrisma();
  const { id } = await params;
  const body = await request.json();
  const { date, amount, type, categoryId, memo, settled } = body;

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(amount !== undefined ? { amount: Math.round(Number(amount)) } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(memo !== undefined ? { memo: memo || null } : {}),
      ...(settled !== undefined ? { settled: settled === true } : {}),
    },
    include: { category: true },
  });
  return Response.json(transaction);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrisma();
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
