"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
type StaffSide = "admin" | "reviewer"

function staffNavKind(input: {
  path: string
  side: StaffSide | null
  isAdmin: boolean
  isReviewer: boolean
}): StaffSide | null {
  if (input.path.startsWith("/reviewer") && input.isReviewer) return "reviewer"
  if (input.path.startsWith("/admin") && input.isAdmin) return "admin"
  if (input.side === "reviewer" && input.isReviewer) return "reviewer"
  if (input.side === "admin" && input.isAdmin) return "admin"
  if (input.isReviewer && !input.isAdmin) return "reviewer"
  if (input.isAdmin && !input.isReviewer) return "admin"
  return null
}

export function StaffNav({
  isAdmin,
  isReviewer,
  side,
  navLink,
}: {
  isAdmin: boolean
  isReviewer: boolean
  side: StaffSide | null
  navLink: string
}) {
  const path = usePathname()
  const kind = staffNavKind({ path, side, isAdmin, isReviewer })
  if (kind === "reviewer") {
    return (
      <Link className={navLink} href="/reviewer">
        Reviews
      </Link>
    )
  }
  if (kind === "admin") {
    return (
      <>
        <Link className={navLink} href="/admin">
          Admin
        </Link>
        <Link className={navLink} href="/admin/people">
          People
        </Link>
        <Link className={navLink} href="/admin/companies">
          Companies
        </Link>
        <Link className={navLink} href="/admin/evaluators">
          Evaluators
        </Link>
      </>
    )
  }
  return null
}
