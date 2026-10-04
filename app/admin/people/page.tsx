import type { Metadata } from "next"
import { setAccountKind, setStaffKind } from "@/app/actions/staff"
import { Container } from "@/components/ui"
import { isDemoAccountEmail } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { staffLabel } from "@/lib/staff"
import { btnSecondary } from "@/lib/styles"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "People" }

export default async function PeoplePage() {
  await requireAdmin()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { workerProfile: { select: { name: true, country: true } }, employerProfile: { select: { companyName: true } } },
  })
  const people = users.filter((user) => !isDemoAccountEmail(user.email))

  return (
    <Container className="page-frame max-w-3xl!">
      <h1 className="text-3xl tracking-tight">People and roles</h1>
      <p className="mt-2 text-muted">
        Give someone admin, reviewer, or both. If they signed up on the wrong side, switch company and evaluator.
      </p>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {people.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No accounts yet.</li>
        ) : (
          people.map((person) => (
            <li key={person.id} className="space-y-3 px-4 py-4 text-sm">
              <div>
                <p className="font-medium">
                  {person.workerProfile?.name || person.employerProfile?.companyName || person.email}
                </p>
                <p className="text-muted">
                  {person.email}
                  {person.workerProfile?.country ? ` · ${person.workerProfile.country}` : ""}
                  {" · "}
                  {staffLabel(person)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={setStaffKind} className="flex flex-wrap gap-2">
                  <input type="hidden" name="userId" value={person.id} />
                  <button className={btnSecondary} name="staffKind" value="reviewer">
                    Reviewer
                  </button>
                  <button className={btnSecondary} name="staffKind" value="admin">
                    Admin
                  </button>
                  <button className={btnSecondary} name="staffKind" value="both">
                    Both
                  </button>
                </form>
                <form action={setAccountKind} className="flex flex-wrap gap-2">
                  <input type="hidden" name="userId" value={person.id} />
                  <button className={btnSecondary} name="accountKind" value="worker">
                    Make evaluator
                  </button>
                  <button className={btnSecondary} name="accountKind" value="employer">
                    Make company
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </Container>
  )
}
