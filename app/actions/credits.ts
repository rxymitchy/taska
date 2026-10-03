"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { CREDIT_PACKS } from "@/lib/credit-packs"
import { lightningProviderName } from "@/lib/pricing"
import { applyPaidDeposit, settlePaidDeposits } from "@/lib/credits"
import { requireRole } from "@/lib/session"
import { getLightningService } from "@/services/lightning"

const PACKS = CREDIT_PACKS

export type CreditActionState = {
  error: string
  invoice?: string
  checkoutUrl?: string
  depositId?: string
}

export type CreditCheckState = { status: "PENDING" | "PAID" | "FAILED"; error: string }

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
    const deposit = await prisma.creditDeposit.create({
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
    return { error: "", invoice: created.invoice, checkoutUrl: created.checkoutUrl, depositId: deposit.id }
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

export async function checkCreditDeposit(depositId: string): Promise<CreditCheckState> {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!company) return { status: "FAILED", error: "Company profile not found." }

  const deposit = await prisma.creditDeposit.findFirst({
    where: { id: depositId, companyId: company.id },
  })
  if (!deposit) return { status: "FAILED", error: "Invoice not found." }
  if (deposit.status === "PAID") return { status: "PAID", error: "" }
  if (deposit.status === "FAILED") return { status: "FAILED", error: "This invoice expired." }

  try {
    if (lightningProviderName() === "mock") {
      await applyPaidDeposit(deposit.paymentHash)
      revalidatePath("/employer")
      revalidatePath("/employer/credits")
      revalidatePath("/employer/evaluations/new")
      return { status: "PAID", error: "" }
    }

    const lightning = getLightningService()
    const status = await lightning.getPaymentStatus(
      deposit.paymentHash,
      deposit.invoice,
      deposit.amountSats,
    )
    if (status.status === "PAID") {
      if (status.amountSats && status.amountSats !== deposit.amountSats) {
        return { status: "PENDING", error: "" }
      }
      await applyPaidDeposit(deposit.paymentHash)
      revalidatePath("/employer")
      revalidatePath("/employer/credits")
      revalidatePath("/employer/evaluations/new")
      return { status: "PAID", error: "" }
    }
    return { status: status.status, error: "" }
  } catch (error) {
    return {
      status: "PENDING",
      error: error instanceof Error ? error.message : "Could not check that payment. Try again.",
    }
  }
}

export async function confirmCreditDeposit(formData: FormData) {
  const depositId = String(formData.get("depositId") ?? "")
  if (!depositId) return
  await checkCreditDeposit(depositId)
}

export async function refreshCompanyCredits() {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!company) return
  await settlePaidDeposits(company.id)
  revalidatePath("/employer")
  revalidatePath("/employer/credits")
  revalidatePath("/employer/evaluations/new")
}
