import type { Metadata } from "next"
import Link from "next/link"
import { ConfirmDepositButton, CreditsForm } from "@/components/credits-form"
import { Container } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { companyCostPerEvaluation, evaluatorPayoutSats, reviewerPayoutSats, lightningProviderName } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Credits" }

export default async function CreditsPage() {
  const user = await requireRole(["EMPLOYER"])
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

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-3xl tracking-tight">Work credits</h1>
      <p className="mt-2 text-muted">
        Pay a Lightning invoice to fund evaluations. Each approved item costs {formatSats(cost)} (
        {formatSats(evaluatorPayoutSats())} evaluator, {formatSats(reviewerPayoutSats())} reviewer, plus 2% platform
        fee). Rejected work returns the hold. Credits are a company budget, not a worker wallet.
        {rail === "nwc"
          ? " Invoices are created on Taska’s Alby Hub over Nostr Wallet Connect. Bitcoin stays in that wallet, not in Taska’s database."
          : mock
            ? " This server is in demo mode until NWC_URL is set."
            : ""}
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-card px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted">Available</dt>
          <dd className="mt-1 font-display text-2xl">{formatSats(company.prepaidSats)}</dd>
        </div>
        <div className="rounded-lg border border-line bg-card px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted">Held for open work</dt>
          <dd className="mt-1 font-display text-2xl">{formatSats(company.heldSats)}</dd>
        </div>
      </dl>
      <div className="mt-8">
        <CreditsForm mock={mock} />
      </div>
      {company.creditDeposits.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg">Invoices</h2>
          <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-card">
            {company.creditDeposits.map((deposit) => (
              <li key={deposit.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>
                  <span className="block font-medium">{formatSats(deposit.amountSats)}</span>
                  <span className="text-muted">{deposit.status}</span>
                </span>
                {deposit.status === "PENDING" ? <ConfirmDepositButton depositId={deposit.id} mock={mock} /> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {company.creditLedger.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg">Recent activity</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {company.creditLedger.map((row) => (
              <li key={row.id}>
                {row.kind} · {formatSats(row.amountSats)}
                {row.note ? ` · ${row.note}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="mt-8 text-sm">
        <Link className="text-accent underline" href="/employer/evaluations/new">
          New evaluation
        </Link>
        {" · "}
        <Link className="text-accent underline" href="/employer/upload">
          Upload a file
        </Link>
      </p>
    </Container>
  )
}
