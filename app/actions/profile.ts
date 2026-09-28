"use server"

import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { requireRole } from "@/lib/session"
import { profileSchema } from "@/lib/validators"

export type ProfileState = { error: string; saved: boolean }

function listFromComma(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireRole(["WORKER"])
  const limit = rateLimit(`profile:${user.id}`, 20, 60 * 60 * 1000)
  if (!limit.ok) return { error: "Too many updates. Try again later.", saved: false }

  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!profile) return { error: "Profile not found.", saved: false }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    country: formData.get("country"),
    bio: formData.get("bio") ?? "",
    skills: formData.get("skills") ?? "",
    languages: formData.getAll("languages"),
    githubUrl: formData.get("githubUrl") ?? "",
    portfolioUrl: formData.get("portfolioUrl") ?? "",
    lightningAddress: formData.get("lightningAddress") ?? "",
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again.", saved: false }
  }

  const file = formData.get("cv")
  let cvFileName = profile.cvFileName
  if (file instanceof File && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) {
      return { error: "CV must be a PDF under 5 MB.", saved: false }
    }
    const bytes = Buffer.from(await file.arrayBuffer())
    const header = bytes.subarray(0, 4).toString("utf8")
    const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    if (!looksLikePdf || header !== "%PDF") {
      return { error: "Upload a PDF file.", saved: false }
    }
    const dir = path.join(process.cwd(), "uploads", "cvs")
    await mkdir(dir, { recursive: true })
    cvFileName = `${profile.id}.pdf`
    await writeFile(path.join(dir, cvFileName), bytes)
  }

  await prisma.workerProfile.update({
    where: { id: profile.id },
    data: {
      name: parsed.data.name,
      country: parsed.data.country,
      bio: parsed.data.bio,
      skills: listFromComma(parsed.data.skills),
      languages: parsed.data.languages,
      githubUrl: parsed.data.githubUrl || null,
      portfolioUrl: parsed.data.portfolioUrl || null,
      lightningAddress: parsed.data.lightningAddress || null,
      cvFileName,
    },
  })

  revalidatePath("/profile")
  revalidatePath(`/workers/${profile.id}`)
  revalidatePath("/dashboard")
  return { error: "", saved: true }
}
