import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrisma();
  const { id } = await params;
  const body = await request.json();
  const { name, category } = body;

  if (category && category !== "LIQUID" && category !== "RESTRICTED") {
    return Response.json(
      { error: "category は LIQUID か RESTRICTED を指定してください" },
      { status: 400 }
    );
  }

  const account = await prisma.account.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(category !== undefined ? { category } : {}),
    },
  });
  return Response.json(account);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrisma();
  const { id } = await params;
  await prisma.account.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
