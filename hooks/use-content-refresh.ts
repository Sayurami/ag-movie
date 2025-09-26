"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useContentRefresh() {
  useEffect(() => {
    const supabase = createClient()
    const now = new Date().toISOString()

    // Check for content that should be released every 30 seconds
    const interval = setInterval(async () => {
      try {
        // Check for movies that should be released
        const { data: moviesToRelease, error: movieError } = await supabase
          .from("movies")
          .update({ status: "active" })
          .eq("status", "coming_soon")
          .lte("scheduled_release", now)
          .select("id, title")

        if (movieError) {
          console.error("Movie auto-release error:", movieError)
          return
        }

        // Check for TV shows that should be released
        const { data: tvShowsToRelease, error: tvError } = await supabase
          .from("tv_shows")
          .update({ status: "active" })
          .eq("status", "coming_soon")
          .lte("scheduled_release", now)
          .select("id, name")

        if (tvError) {
          console.error("TV show auto-release error:", tvError)
          return
        }

        // If any content was released, refresh the page
        if ((moviesToRelease?.length || 0) + (tvShowsToRelease?.length || 0) > 0) {
          // Only refresh if we're not on the admin page (to avoid interrupting admin work)
          if (!window.location.pathname.includes('/admin')) {
            window.location.reload()
          }
        }
      } catch (error) {
        console.error("Content refresh check failed:", error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])
}
