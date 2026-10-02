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
    <Container className="page-frame">
      <div className="mx-auto w-full max-w-2xl">
        <header className="page-intro">
          <h1 className="text-3xl tracking-tight">Your profile</h1>
          <p className="mt-2 text-sm text-muted">
            Put where you get paid. A CV is optional — the work is the record.
          </p>
        </header>
        <div className="form-surface mt-6">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </Container>
  )
}
