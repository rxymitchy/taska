import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Sign in to follow evaluations.", { status: 401 })
  }
  if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const company = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      evaluations: {
        select: { id: true, status: true, assignedWorkerId: true, completedAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  const stamp = (company?.evaluations ?? [])
    .map((row) => `${row.id}:${row.status}:${row.assignedWorkerId ?? ""}:${row.completedAt?.toISOString() ?? ""}`)
    .join("|")

  return new NextResponse(stamp, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  })
}
