import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";

let cached: PrismaClient | undefined;

export async function getPrisma() {
  if (cached) return cached;
  const { env } = await getCloudflareContext({ async: true });
  const adapter = new PrismaD1(env.DB);
  cached = new PrismaClient({ adapter });
  return cached;
}
