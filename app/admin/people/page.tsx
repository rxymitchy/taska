import type { Metadata } from "next"
import { setAccountKind, setStaffKind } from "@/app/actions/staff"
import { Container, PageHeader, Panel } from "@/components/ui"
import { notDemoEmailWhere } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { staffLabel } from "@/lib/staff"
import { btnSecondary } from "@/lib/styles"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "People" }

export default async function PeoplePage() {
  await requireAdmin()
  const people = await prisma.user.findMany({
    where: notDemoEmailWhere(),
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { workerProfile: { select: { name: true, country: true } }, employerProfile: { select: { companyName: true } } },
  })

  return (
    <Container className="page-frame max-w-3xl!">
      <PageHeader
        title="People and roles"
        description="Give someone admin, reviewer, or both. If they signed up on the wrong side, switch company and evaluator."
      />
      <Panel className="mt-10">
      <ul className="divide-y divide-[#12382b]/8">
        {people.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No accounts yet.</li>
        ) : (
          people.map((person) => (
            <li key={person.id} className="space-y-3 px-5 py-5 text-sm">
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
      </Panel>
    </Container>
  )
}
