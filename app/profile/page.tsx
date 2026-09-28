import type { Metadata } from "next"
import { ProfileForm } from "@/components/profile-form"
import { Container } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfilePage() {
  const user = await requireRole(["WORKER"])
  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!profile) return null

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-3xl tracking-tight">Your profile</h1>
      <p className="mt-2 text-sm text-muted">
        A CV is optional. Your record on Taska is the work you complete and the approvals you earn.
      </p>
      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>
    </Container>
  )
}
