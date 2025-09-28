"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie, TVShow } from "@/lib/types"
import { Calendar, Film, Tv, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function ComingSoonManager() {
  const [comingSoonItems, setComingSoonItems] = useState<(Movie | TVShow)[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchComingSoonItems()
    
    // Set up auto-refresh every 30 seconds to check for items that should be released
    const interval = setInterval(() => {
      checkAndReleaseItems()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const checkAndReleaseItems = async () => {
    const supabase = createClient()
    const now = new Date().toISOString()

    try {
      // Check for movies that should be released
      const { data: moviesToRelease, error: movieError } = await supabase
        .from("movies")
        .update({ status: "active" })
        .eq("status", "coming_soon")
        .lte("scheduled_release", now)
        .select("id, title")

      if (movieError) throw movieError

      // Check for TV shows that should be released
      const { data: tvShowsToRelease, error: tvError } = await supabase
        .from("tv_shows")
        .update({ status: "active" })
        .eq("status", "coming_soon")
        .lte("scheduled_release", now)
        .select("id, name")

      if (tvError) throw tvError

      // If any items were released, refresh the list and show notification
      if ((moviesToRelease?.length || 0) + (tvShowsToRelease?.length || 0) > 0) {
        fetchComingSoonItems()
        
        const releasedItems = [
          ...(moviesToRelease || []).map(item => item.title),
          ...(tvShowsToRelease || []).map(item => item.name)
        ]
        
        toast({
          title: "Content Released!",
          description: `${releasedItems.join(", ")} ${releasedItems.length === 1 ? "is" : "are"} now live!`,
        })
      }
    } catch (error) {
      console.error("Auto-release check failed:", error)
    }
  }

  const fetchComingSoonItems = async () => {
    const supabase = createClient()

    try {
      const [moviesResult, tvShowsResult] = await Promise.all([
        supabase.from("movies").select("*").eq("status", "coming_soon").or("part_number.is.null,part_number.eq.1").order("scheduled_release", { ascending: true }), // Only show standalone movies or Part 1
        supabase
          .from("tv_shows")
          .select("*")
          .eq("status", "coming_soon")
          .order("scheduled_release", { ascending: true }),
      ])

      const allItems = [
        ...(moviesResult.data || []).map((item) => ({ ...item, type: "movie" as const })),
        ...(tvShowsResult.data || []).map((item) => ({ ...item, type: "tv_show" as const })),
      ].sort((a, b) => {
        if (!a.scheduled_release) return 1
        if (!b.scheduled_release) return -1
        return new Date(a.scheduled_release).getTime() - new Date(b.scheduled_release).getTime()
      })

      setComingSoonItems(allItems)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch coming soon items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReleaseNow = async (item: Movie | TVShow) => {
    const supabase = createClient()
    const table = "title" in item ? "movies" : "tv_shows"

    try {
      const { error } = await supabase.from(table).update({ status: "active" }).eq("id", item.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `${"title" in item ? item.title : item.name} is now live!`,
      })

      fetchComingSoonItems()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to release content",
        variant: "destructive",
      })
    }
  }

  if (!mounted || loading) {
    return <div className="text-center py-8">Loading coming soon items...</div>
  }

  if (comingSoonItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Scheduled Releases</h3>
        <p className="text-muted-foreground">Add movies or TV shows with scheduled release dates to see them here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comingSoonItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <img
                src={getTMDBImageUrl(item.poster_path) || "/placeholder.svg"}
                alt={"title" in item ? item.title : item.name}
                className="w-20 h-30 object-cover rounded"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{"title" in item ? item.title : item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.overview}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {"title" in item ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                        {"title" in item ? "Movie" : "TV Show"}
                      </Badge>
                      {item.scheduled_release && (
                        <Badge variant="secondary">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.scheduled_release).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => handleReleaseNow(item)} size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Release Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
