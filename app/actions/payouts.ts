"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/session"
import { retryFailedPayouts as settleFailed } from "@/services/settlement"

export async function retryFailedPayouts() {
  await requireRole(["ADMIN"])
  await settleFailed()
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/employer")
}
