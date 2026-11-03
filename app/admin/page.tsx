import type { Metadata } from "next"
import Link from "next/link"
import { retryFailedPayouts } from "@/app/actions/payouts"
import { Container, PageHeader, Panel, SatsAmount, StatCard } from "@/components/ui"
import { lightningProviderName } from "@/lib/pricing"
import { notDemoCompanyWhere } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
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
  await requireAdmin()
  const [failedPayouts, till] = await Promise.all([
    prisma.evaluationPayout.findMany({
      where: { status: "FAILED", evaluation: { company: notDemoCompanyWhere() } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    readTillSats(),
  ])

  return (
    <Container className="page-frame">
      <PageHeader title="Admin" description="People, payouts, and the till." />
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link className={btnSecondary} href="/admin/people">
          People
        </Link>
        <Link className={btnSecondary} href="/admin/companies">
          Companies
        </Link>
        <Link className={btnSecondary} href="/admin/evaluators">
          Evaluators
        </Link>
      </div>
      {till.kind === "ok" ? (
        <div className="mt-10 max-w-md">
          <StatCard label="Bitcoin in the till">
            <SatsAmount sats={till.balanceSats} />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              What companies have paid in, minus what we have paid out.
            </p>
          </StatCard>
        </div>
      ) : till.kind === "error" ? (
        <Panel className="mt-10 px-5 py-5">
          <p className="text-sm text-muted">{till.message}</p>
        </Panel>
      ) : null}
      {failedPayouts.length > 0 ? (
        <form action={retryFailedPayouts} className="mt-8 max-w-md">
          <Panel className="px-5 py-5">
            <p className="text-sm leading-relaxed">
              {failedPayouts.length === 1 ? "One payment failed." : `${failedPayouts.length} payments failed.`} Retry
              pays the address on the profile now. It does not pay a row that already says Sent.
            </p>
            <button className={`${btnSecondary} mt-4`} type="submit">
              Retry failed payouts
            </button>
          </Panel>
        </form>
      ) : (
        <p className="mt-8 text-sm text-muted">No failed payouts right now.</p>
      )}
    </Container>
  )
}
