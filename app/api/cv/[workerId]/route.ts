import { readFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  context: { params: Promise<{ workerId: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Sign in to view this CV.", { status: 401 })
  }
  const { workerId } = await context.params
  if (session.user.role === "WORKER") {
    const own = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } })
    if (own?.id !== workerId) return new NextResponse("Forbidden", { status: 403 })
  }

  const worker = await prisma.workerProfile.findUnique({ where: { id: workerId } })
  if (!worker?.cvFileName) return new NextResponse("CV not found", { status: 404 })

  const filePath = path.join(process.cwd(), "uploads", "cvs", worker.cvFileName)
  try {
    const data = await readFile(filePath)
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="cv.pdf"',
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new NextResponse("CV not found", { status: 404 })
  }
}
