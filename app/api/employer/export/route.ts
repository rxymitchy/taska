import { stringify } from "csv-stringify/sync"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildExportRows } from "@/services/reports/export"

const Query = z.object({ format: z.enum(["csv", "json"]).default("json") })
const CSV_COLUMNS = [
  "evaluationId",
  "prompt",
  "aiResponse",
  "aiModel",
  "language",
  "context",
  "factuallyCorrect",
  "languageNatural",
  "understandsContext",
  "betterAnswer",
  "comment",
  "validated",
  "completedAt",
] as const

const safeCsvValue = (value: unknown) =>
  typeof value === "string" && /^[=+\-@]/.test(value) ? `'${value}` : value

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Sign in to export evaluations.", { status: 401 })
  }
  if (session.user.role !== "EMPLOYER") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const parsed = Query.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  )
  if (!parsed.success) {
    return new NextResponse("format must be csv or json", { status: 400 })
  }

  const company = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!company) {
    return new NextResponse("Company profile not found.", { status: 404 })
  }

  const rows = await buildExportRows(company.id)
  const { format } = parsed.data
  const headers = {
    "Content-Disposition": `attachment; filename="taska-validated-evaluations.${format}"`,
    "X-Content-Type-Options": "nosniff",
  }

  if (format === "csv") {
    const csv = stringify(
      rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key, safeCsvValue(value)]),
        ),
      ),
      { header: true, columns: [...CSV_COLUMNS] },
    )
    return new NextResponse("\uFEFF" + csv, {
      headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
    })
  }

  return new NextResponse(JSON.stringify(rows, null, 2), {
    headers: { ...headers, "Content-Type": "application/json" },
  })
}
