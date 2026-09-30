import { prisma } from "@/lib/prisma"
import { lightningProviderName } from "@/lib/pricing"

export const dynamic = "force-dynamic"

export async function GET() {
  const db = Boolean(process.env.DATABASE_URL)
  const lightning = lightningProviderName()
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ ok: true, db, lightning })
  } catch {
    return Response.json({ ok: false, db, lightning }, { status: 503 })
  }
}
