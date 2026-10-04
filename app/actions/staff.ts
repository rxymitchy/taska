"use server"

import { revalidatePath } from "next/cache"
import { isDemoAccountEmail } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { parseStaffKind, staffFlags } from "@/lib/staff"

function paths() {
  revalidatePath("/admin")
  revalidatePath("/admin/people")
  revalidatePath("/admin/invite")
  revalidatePath("/admin/companies")
  revalidatePath("/admin/evaluators")
  revalidatePath("/dashboard")
  revalidatePath("/employer")
}

export async function setStaffKind(formData: FormData) {
  const admin = await requireAdmin()
  const userId = String(formData.get("userId") ?? "")
  const kind = parseStaffKind(formData.get("staffKind"))
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || isDemoAccountEmail(user.email)) return
  if (user.id === admin.id && kind === "reviewer") return

  const flags = staffFlags(kind)
  const keepAccount = user.role === "WORKER" || user.role === "EMPLOYER"
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isAdmin: flags.isAdmin,
      isReviewer: flags.isReviewer,
      role: keepAccount ? user.role : flags.role,
    },
  })
  paths()
}

export async function setAccountKind(formData: FormData) {
  await requireAdmin()
  const userId = String(formData.get("userId") ?? "")
  const account = String(formData.get("accountKind") ?? "")
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { workerProfile: true, employerProfile: true },
  })
  if (!user || isDemoAccountEmail(user.email)) return

  if (account === "employer") {
    if (!user.employerProfile) {
      await prisma.employerProfile.create({
        data: { userId: user.id, companyName: user.workerProfile?.name || user.email.split("@")[0] },
      })
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "EMPLOYER" },
    })
  }

  if (account === "worker") {
    if (!user.workerProfile) {
      await prisma.workerProfile.create({
        data: {
          userId: user.id,
          name: user.employerProfile?.companyName || user.email.split("@")[0],
          country: "Kenya",
          languages: [],
          skills: [],
        },
      })
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "WORKER", isReviewer: false },
    })
  }

  paths()
}
