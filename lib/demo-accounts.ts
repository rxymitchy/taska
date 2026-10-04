import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export function isDemoAccountEmail(email: string) {
  return /@(taska\.demo|demo\.taska)$/i.test(email.trim())
}

/** Prisma filter: real accounts only. */
export function notDemoEmailWhere() {
  return {
    AND: [
      { NOT: { email: { endsWith: "@taska.demo" } } },
      { NOT: { email: { endsWith: "@demo.taska" } } },
    ],
  }
}

export function notDemoCompanyWhere() {
  return { user: notDemoEmailWhere() }
}

const OPEN = ["PENDING", "ASSIGNED", "WORKER_COMPLETED", "UNDER_REVIEW"] as const

export function isLiveSite() {
  const url = process.env.DATABASE_URL || ""
  return Boolean(process.env.VERCEL) || process.env.TASKA_LIVE === "true" || /neon\.tech/i.test(url)
}

export function refuseDemoSeed() {
  if (isLiveSite()) {
    throw new Error("Refusing to seed demo accounts on the live database.")
  }
}

let retired = false

/** Unassigns live work from seed accounts and locks those logins. */
export async function retireDemoAccounts() {
  if (retired || !isLiveSite()) return
  const demoUsers = await prisma.user.findMany({
    where: {
      OR: [{ email: { endsWith: "@taska.demo" } }, { email: { endsWith: "@demo.taska" } }],
    },
    select: { id: true, workerProfile: { select: { id: true } } },
  })
  if (demoUsers.length === 0) {
    retired = true
    return
  }

  const workerIds = demoUsers
    .map((user) => user.workerProfile?.id)
    .filter((id): id is string => Boolean(id))
  if (workerIds.length > 0) {
    await prisma.evaluation.updateMany({
      where: { assignedWorkerId: { in: workerIds }, status: { in: [...OPEN] } },
      data: { status: "PENDING", assignedWorkerId: null, assignedAt: null },
    })
  }

  const demoCompanies = await prisma.employerProfile.findMany({
    where: { userId: { in: demoUsers.map((user) => user.id) } },
    select: { id: true },
  })
  if (demoCompanies.length > 0) {
    await prisma.evaluation.updateMany({
      where: { companyId: { in: demoCompanies.map((company) => company.id) }, status: { in: [...OPEN] } },
      data: {
        status: "REJECTED",
        assignedWorkerId: null,
        assignedAt: null,
        reviewerUserId: null,
        reviewerAssignedAt: null,
      },
    })
  }

  const passwordHash = await hash(randomBytes(32).toString("hex"), 10)
  await prisma.user.updateMany({
    where: { id: { in: demoUsers.map((user) => user.id) } },
    data: { passwordHash },
  })
  retired = true
}

export function isDemoLoginBlocked(email: string) {
  return isLiveSite() && isDemoAccountEmail(email)
}
