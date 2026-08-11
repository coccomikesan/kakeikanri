import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const accounts = await prisma.account.findMany({
    include: { snapshots: { orderBy: { date: "asc" } } },
    orderBy: { name: "asc" },
  });
  return Response.json(accounts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, category } = body;

  if (!name) {
    return Response.json({ error: "name は必須です" }, { status: 400 });
  }
  if (category && category !== "LIQUID" && category !== "RESTRICTED") {
    return Response.json(
      { error: "category は LIQUID か RESTRICTED を指定してください" },
      { status: 400 }
    );
  }

  const account = await prisma.account.create({
    data: { name, category: category ?? "LIQUID" },
  });
  return Response.json(account, { status: 201 });
}
