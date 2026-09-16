import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = await getPrisma();
  const categories = await prisma.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return Response.json(categories);
}

export async function POST(request: NextRequest) {
  const prisma = await getPrisma();
  const body = await request.json();
  const { name, type, color, costType } = body;

  if (!name || (type !== "INCOME" && type !== "EXPENSE")) {
    return Response.json({ error: "name と type(INCOME/EXPENSE) は必須です" }, { status: 400 });
  }
  if (costType && costType !== "FIXED" && costType !== "VARIABLE") {
    return Response.json(
      { error: "costType は FIXED か VARIABLE を指定してください" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: { name, type, color: color ?? null, costType: costType ?? null },
  });
  return Response.json(category, { status: 201 });
}
