"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/session"
import { retryFailedPayouts as settleFailed } from "@/services/settlement"

export async function retryFailedPayouts() {
  await requireAdmin()
  await settleFailed()
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/employer")
}
