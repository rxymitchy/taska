"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { checkCreditDeposit } from "@/app/actions/credits"

export function PendingCreditWatcher({ depositIds }: { depositIds: string[] }) {
  const router = useRouter()

  useEffect(() => {
    if (depositIds.length === 0) return

    let cancelled = false
    async function tick() {
      for (const id of depositIds) {
        const result = await checkCreditDeposit(id)
        if (cancelled) return
        if (result.status === "PAID") {
          router.refresh()
          return
        }
      }
    }

    void tick()
    const timer = window.setInterval(() => void tick(), 8000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [depositIds, router])

  return null
}
