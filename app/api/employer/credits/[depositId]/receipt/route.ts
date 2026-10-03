import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { creditReceiptFilename, renderCreditReceipt } from "@/lib/credit-receipt"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  context: { params: Promise<{ depositId: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Sign in to download this receipt.", { status: 401 })
  }
  if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { depositId } = await context.params
  const company = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, companyName: true },
  })
  if (!company) {
    return new NextResponse("Company profile not found.", { status: 404 })
  }

  const deposit = await prisma.creditDeposit.findFirst({
    where: { id: depositId, companyId: company.id, status: "PAID" },
  })
  if (!deposit) {
    return new NextResponse("Paid receipt not found.", { status: 404 })
  }

  const html = renderCreditReceipt({
    companyName: company.companyName,
    amountSats: deposit.amountSats,
    status: "PAID",
    invoice: deposit.invoice,
    paymentHash: deposit.paymentHash,
    createdAt: deposit.createdAt,
    paidAt: deposit.paidAt,
    receiptId: deposit.id,
  })

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${creditReceiptFilename(deposit.id)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  })
}
