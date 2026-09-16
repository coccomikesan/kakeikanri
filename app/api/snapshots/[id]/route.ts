import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrisma();
  const { id } = await params;
  await prisma.assetSnapshot.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
