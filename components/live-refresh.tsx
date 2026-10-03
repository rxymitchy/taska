"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

/** Refreshes the page when the status snapshot from `href` changes. */
export function LiveRefresh({ href }: { href: string }) {
  const router = useRouter()
  const last = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function tick() {
      try {
        const response = await fetch(href, { cache: "no-store" })
        if (!response.ok) return
        const stamp = await response.text()
        if (cancelled) return
        if (last.current != null && last.current !== stamp) router.refresh()
        last.current = stamp
      } catch {
        // Stay on the current view if the check fails.
      }
    }

    void tick()
    const timer = window.setInterval(() => void tick(), 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [href, router])

  return null
}
