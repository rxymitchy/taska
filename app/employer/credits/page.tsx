import type { Metadata } from "next"
import Link from "next/link"
import { CopyInvoiceButton } from "@/components/copy-invoice-button"
import { DownloadReceiptButton } from "@/components/download-receipt-button"
import { ConfirmDepositButton, CreditsForm } from "@/components/credits-form"
import { PendingCreditWatcher } from "@/components/pending-credit-watcher"
import { PendingInvoiceActions } from "@/components/pending-invoice-actions"
import { Container, StatusPill } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { settlePaidDeposits } from "@/lib/credits"
import { companyCostPerEvaluation, evaluatorPayoutSats, reviewerPayoutSats, lightningProviderName } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Add credit" }
export const maxDuration = 60

export default async function CreditsPage() {
  const user = await requireRole(["EMPLOYER"])
  const existing = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!existing) return null
  try {
    await settlePaidDeposits(existing.id)
  } catch {
    // Still show the page if the till check is slow or down.
  }

  const company = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: {
      creditDeposits: { orderBy: { createdAt: "desc" }, take: 8 },
      creditLedger: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  })
  if (!company) return null

  const cost = companyCostPerEvaluation()
  const rail = lightningProviderName()
  const mock = rail === "mock"
  const pendingIds = company.creditDeposits.filter((row) => row.status === "PENDING").map((row) => row.id)

  return (
    <Container className="page-frame max-w-2xl!">
      <header className="page-intro">
      <h1 className="text-3xl tracking-tight">Add credit so people can get paid</h1>
      <p className="mt-2 text-muted">
        Pay once, then send answers to check. Each agreed check costs {formatSats(cost)} (
        {formatSats(evaluatorPayoutSats())} to the person who checked it, {formatSats(reviewerPayoutSats())} to the
        reviewer). If the check is sent back, that hold comes back to you. Pay by card at full price, or by Bitcoin for
        10% off.
        {rail === "breez"
          ? " A Lightning invoice adds the credit when the payment arrives."
          : " Demo: you can mark a Bitcoin payment as paid to try the flow."}
      </p>
      </header>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-card px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted">Available</dt>
          <dd className="mt-1"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-display text-2xl text-ink">{formatSats(company.prepaidSats)}</span></dd>
        </div>
        <div className="rounded-lg border border-line bg-card px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted">Held for open work</dt>
          <dd className="mt-1"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-display text-2xl text-ink">{formatSats(company.heldSats)}</span></dd>
        </div>
      </dl>
      <div className="form-surface mt-6">
        {rail === "breez" ? <PendingCreditWatcher depositIds={pendingIds} /> : null}
        <CreditsForm mock={mock} />
      </div>
      {company.creditDeposits.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg">Invoices</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line bg-card">
            {company.creditDeposits.map((deposit) => (
              <li key={deposit.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>
                  <span className="block font-medium">{formatSats(deposit.amountSats)}</span>
                  <span className="mt-1 block"><StatusPill status={deposit.status} /></span>
                </span>
                {deposit.status === "PENDING" ? (
                  <PendingInvoiceActions
                    invoice={deposit.invoice}
                    confirm={<ConfirmDepositButton depositId={deposit.id} mock={mock} />}
                  />
                ) : (
                  <span className="flex flex-wrap items-center justify-end gap-2">
                    {deposit.status === "PAID" ? <DownloadReceiptButton depositId={deposit.id} /> : null}
                    <CopyInvoiceButton invoice={deposit.invoice} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {company.creditLedger.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg">Recent activity</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line text-sm text-muted">
            {company.creditLedger.map((row) => (
              <li key={row.id} className="py-3">
                <span>{row.kind} · </span>
                <span className="inline-flex rounded-md bg-hl px-2 py-0.5 font-semibold tabular-nums text-ink">{formatSats(row.amountSats)}</span>
                {row.note ? ` · ${row.note}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="mt-8 text-sm">
        <Link className="text-accent underline" href="/employer/evaluations/new">
          Check an answer
        </Link>
        {" · "}
        <Link className="text-accent underline" href="/employer/upload">
          Upload many
        </Link>
      </p>
    </Container>
  )
}
