import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, type, color, costType } = body;

  if (costType && costType !== "FIXED" && costType !== "VARIABLE") {
    return Response.json(
      { error: "costType は FIXED か VARIABLE を指定してください" },
      { status: 400 }
    );
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(color !== undefined ? { color: color ?? null } : {}),
      ...(costType !== undefined ? { costType: costType ?? null } : {}),
    },
  });
  return Response.json(category);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const usageCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (usageCount > 0) {
    return Response.json(
      { error: "このカテゴリは取引で使用されているため削除できません" },
      { status: 409 }
    );
  }

  await prisma.budget.deleteMany({ where: { categoryId: id } });
  await prisma.category.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
