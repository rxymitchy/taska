import { createHmac, timingSafeEqual } from "crypto"
import { applyPaidDeposit } from "@/lib/credits"

export const dynamic = "force-dynamic"

function openNodeHashMatches(id: string, hashedOrder: string) {
  const key = process.env.OPENNODE_WEBHOOK_SECRET || process.env.OPENNODE_API_KEY
  if (!key || !hashedOrder) return false
  const digest = createHmac("sha256", key).update(id).digest("hex")
  const a = Buffer.from(digest)
  const b = Buffer.from(hashedOrder)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { id?: string; status?: string; hashed_order?: string }
    | null
  const id = body?.id?.trim()
  if (!id) return Response.json({ ok: false }, { status: 400 })

  const hashed = body?.hashed_order ?? ""
  if (process.env.OPENNODE_API_KEY && !openNodeHashMatches(id, hashed)) {
    return Response.json({ ok: false }, { status: 401 })
  }

  const status = (body?.status ?? "").toLowerCase()
  if (status === "paid" || status === "completed" || status === "confirmed") {
    await applyPaidDeposit(id)
  }
  return Response.json({ ok: true })
}
