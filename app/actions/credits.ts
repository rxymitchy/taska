"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { CREDIT_PACKS } from "@/lib/credit-packs"
import { lightningProviderName } from "@/lib/pricing"
import { applyPaidDeposit } from "@/lib/credits"
import { requireRole } from "@/lib/session"
import { getLightningService } from "@/services/lightning"

const PACKS = CREDIT_PACKS

export type CreditActionState = { error: string; invoice?: string; checkoutUrl?: string }

/** Company prepay. Live Breez returns a real invoice; mock lets the company mark it paid. */

export async function createCreditInvoice(_prev: CreditActionState, formData: FormData): Promise<CreditActionState> {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!company) return { error: "Company profile not found." }

  const amountSats = Number(formData.get("amountSats"))
  if (!PACKS.includes(amountSats as (typeof PACKS)[number])) {
    return { error: "Choose a credit pack." }
  }

  try {
    const lightning = getLightningService()
    const created = await lightning.createInvoice({
      amountSats,
      memo: `Taska credits ${company.companyName}`.slice(0, 100),
    })
    await prisma.creditDeposit.create({
      data: {
        companyId: company.id,
        amountSats,
        invoice: created.invoice,
        paymentHash: created.paymentHash,
        checkoutUrl: created.checkoutUrl ?? "",
        status: "PENDING",
      },
    })
    revalidatePath("/employer/credits")
    return { error: "", invoice: created.invoice, checkoutUrl: created.checkoutUrl }
  } catch (error) {
    if (lightningProviderName() === "breez") {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Could not create an invoice. Try again.",
      }
    }
    return { error: "Could not create an invoice. Try again." }
  }
}

export async function confirmCreditDeposit(formData: FormData) {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!company) return

  const depositId = String(formData.get("depositId") ?? "")
  const deposit = await prisma.creditDeposit.findFirst({
    where: { id: depositId, companyId: company.id },
  })
  if (!deposit || deposit.status === "PAID") {
    revalidatePath("/employer/credits")
    return
  }

  if (lightningProviderName() === "mock") {
    await applyPaidDeposit(deposit.paymentHash)
    revalidatePath("/employer")
    revalidatePath("/employer/credits")
    revalidatePath("/employer/evaluations/new")
    return
  }

  const lightning = getLightningService()
  const status = await lightning.getPaymentStatus(deposit.paymentHash)
  if (status.status === "PAID") {
    await applyPaidDeposit(deposit.paymentHash)
  }
  revalidatePath("/employer")
  revalidatePath("/employer/credits")
}
