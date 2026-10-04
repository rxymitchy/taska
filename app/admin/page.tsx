import type { Metadata } from "next"
import Link from "next/link"
import { retryFailedPayouts } from "@/app/actions/payouts"
import { Container } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { lightningProviderName } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { canReview } from "@/lib/staff"
import { btnSecondary } from "@/lib/styles"
import { requireAdmin } from "@/lib/session"
import { getLightningService } from "@/services/lightning"

async function readTillSats() {
  if (lightningProviderName() !== "breez") return { kind: "off" as const }
  try {
    const { balanceSats } = await getLightningService().getBalance()
    return { kind: "ok" as const, balanceSats }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read the till."
    return { kind: "error" as const, message }
  }
}

export const metadata: Metadata = { title: "Admin" }
export const maxDuration = 60

export default async function AdminPage() {
  const user = await requireAdmin()
  const [failedPayouts, till] = await Promise.all([
    prisma.evaluationPayout.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    readTillSats(),
  ])

  return (
    <Container className="page-frame">
      <h1 className="text-3xl tracking-tight">Admin</h1>
      <p className="mt-2 text-muted">People, payouts, and the till. Reviews live on the reviewer page.</p>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        {canReview(user) ? (
          <Link className="text-accent underline" href="/reviewer">
            Reviews
          </Link>
        ) : null}
        <Link className="text-accent underline" href="/admin/people">
          People and roles
        </Link>
        <Link className="text-accent underline" href="/admin/companies">
          Companies
        </Link>
        <Link className="text-accent underline" href="/admin/evaluators">
          Evaluators
        </Link>
      </div>
      {till.kind === "ok" ? (
        <div className="mt-6 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Bitcoin in the till</p>
          <p className="mt-2">
            <span className="inline-flex rounded-md bg-hl px-2 py-1 font-display text-2xl tabular-nums text-ink">
              {formatSats(till.balanceSats)}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted">What companies have paid in, minus what we have paid out.</p>
        </div>
      ) : till.kind === "error" ? (
        <div className="mt-6 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-sm text-muted">{till.message}</p>
        </div>
      ) : null}
      {failedPayouts.length > 0 ? (
        <form action={retryFailedPayouts} className="mt-6 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-sm">
            {failedPayouts.length === 1 ? "One payment failed." : `${failedPayouts.length} payments failed.`}{" "}
            Retry pays the address on the profile now. It does not pay a row that already says Sent.
          </p>
          <button className={`${btnSecondary} mt-3`} type="submit">
            Retry failed payouts
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">No failed payouts right now.</p>
      )}
    </Container>
  )
}
