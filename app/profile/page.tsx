import type { Metadata } from "next"
import { ProfileForm } from "@/components/profile-form"
import { Container, PageHeader } from "@/components/ui"
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
        <PageHeader
          title="Your profile"
          description="Put where you get paid. A CV is optional — the work is the record."
        />
        <div className="form-surface mt-10">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </Container>
  )
}
