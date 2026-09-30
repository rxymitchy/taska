import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const db = Boolean(process.env.DATABASE_URL)
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ ok: true, db })
  } catch {
    return Response.json({ ok: false, db }, { status: 503 })
  }
}
