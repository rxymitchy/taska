import { cookies } from "next/headers"

export const STAFF_SIDE_COOKIE = "taska-staff-side"
export type StaffSide = "admin" | "reviewer"

export async function setStaffSide(side: StaffSide) {
  const jar = await cookies()
  jar.set(STAFF_SIDE_COOKIE, side, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function getStaffSide(): Promise<StaffSide | null> {
  const jar = await cookies()
  const value = jar.get(STAFF_SIDE_COOKIE)?.value
  if (value === "admin" || value === "reviewer") return value
  return null
}

export async function clearStaffSide() {
  const jar = await cookies()
  jar.delete(STAFF_SIDE_COOKIE)
}

