"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function useContentRefresh() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only run on non-admin pages
    if (pathname.startsWith("/admin")) {
      return
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/auto-release", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trigger: "manual" }), // Trigger a check without cron secret
        })

        if (response.ok) {
          const data = await response.json()
          if (data.released.movies.length > 0 || data.released.tvShows.length > 0) {
            toast({
              title: "New Content Available!",
              description: "Some coming soon items have been released. Refreshing page...",
            })
            router.refresh() // Refresh the current page
          }
        }
      } catch (error) {
        console.error("Failed to check for new content:", error)
      }
    }, 60000) // Check every 1 minute

    return () => clearInterval(interval)
  }, [router, pathname])
}
