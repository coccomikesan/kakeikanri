import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const yearMonth = request.nextUrl.searchParams.get("yearMonth");
  if (!yearMonth) {
    return Response.json({ error: "yearMonth は必須です" }, { status: 400 });
  }

  const note = await prisma.monthlyNote.findUnique({ where: { yearMonth } });
  return Response.json(note);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { yearMonth, memo } = body;

  if (!yearMonth) {
    return Response.json({ error: "yearMonth は必須です" }, { status: 400 });
  }

  if (!memo || !memo.trim()) {
    await prisma.monthlyNote.deleteMany({ where: { yearMonth } });
    return new Response(null, { status: 204 });
  }

  const note = await prisma.monthlyNote.upsert({
    where: { yearMonth },
    update: { memo },
    create: { yearMonth, memo },
  });
  return Response.json(note);
}
