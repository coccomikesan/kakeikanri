import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { date, balance } = body;

  if (!date || balance === undefined) {
    return Response.json({ error: "date, balance は必須です" }, { status: 400 });
  }

  const snapshot = await prisma.assetSnapshot.create({
    data: {
      accountId: id,
      date: new Date(date),
      balance: Math.round(Number(balance)),
    },
  });
  return Response.json(snapshot, { status: 201 });
}
