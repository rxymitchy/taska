"use server"

import { revalidatePath } from "next/cache"
import { requireReviewer } from "@/lib/session"
import { retryFailedPayouts as settleFailed } from "@/services/settlement"

export async function retryFailedPayouts() {
  await requireReviewer()
  await settleFailed()
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/employer")
}
