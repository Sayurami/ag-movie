"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Clock, Play, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function AutoReleaseStatus() {
  const [upcomingReleases, setUpcomingReleases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)

  useEffect(() => {
    fetchUpcomingReleases()
  }, [])

  const fetchUpcomingReleases = async () => {
    const supabase = createClient()

    try {
      const now = new Date().toISOString()
      const [{ data: movies }, { data: tvShows }] = await Promise.all([
        supabase
          .from("movies")
          .select("*")
          .eq("status", "coming_soon")
          .or("part_number.is.null,part_number.eq.1") // Only show standalone movies or Part 1
          .not("scheduled_release", "is", null)
          .order("scheduled_release", { ascending: true }),
        supabase
          .from("tv_shows")
          .select("*")
          .eq("status", "coming_soon")
          .not("scheduled_release", "is", null)
          .order("scheduled_release", { ascending: true }),
      ])

      const allItems = [
        ...(movies || []).map((item) => ({ ...item, type: "movie" })),
        ...(tvShows || []).map((item) => ({ ...item, type: "tv_show" })),
      ].sort((a, b) => new Date(a.scheduled_release).getTime() - new Date(b.scheduled_release).getTime())

      setUpcomingReleases(allItems)
    } catch (error) {
      console.error("Error fetching upcoming releases:", error)
    } finally {
      setLoading(false)
    }
  }

  const triggerAutoRelease = async () => {
    setReleasing(true)

    try {
      const response = await fetch("/api/cron/auto-release", {
        method: "POST", // Changed to POST for better security
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trigger: "manual" }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Auto-Release Complete",
          description: result.message,
        })
        fetchUpcomingReleases()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Auto-Release Failed",
        description: "Failed to trigger auto-release",
        variant: "destructive",
      })
    } finally {
      setReleasing(false)
    }
  }

  const isReadyForRelease = (scheduledRelease: string) => {
    return new Date(scheduledRelease) <= new Date()
  }

  const readyItems = upcomingReleases.filter((item) => isReadyForRelease(item.scheduled_release))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Auto-Release Status
        </CardTitle>
        <CardDescription>Monitor and manage scheduled content releases</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {readyItems.length} item{readyItems.length !== 1 ? "s" : ""} ready for release
            </p>
            <p className="text-sm text-muted-foreground">
              {upcomingReleases.length - readyItems.length} upcoming release
              {upcomingReleases.length - readyItems.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchUpcomingReleases} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {readyItems.length > 0 && (
              <Button onClick={triggerAutoRelease} size="sm" disabled={releasing}>
                <Play className="h-4 w-4 mr-2" />
                {releasing ? "Releasing..." : "Release Now"}
              </Button>
            )}
          </div>
        </div>

        {upcomingReleases.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {upcomingReleases.slice(0, 10).map((item) => {
              const isReady = isReadyForRelease(item.scheduled_release)
              const title = item.type === "movie" ? item.title : item.name

              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.type === "movie" ? "Movie" : "TV Show"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.scheduled_release).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant={isReady ? "default" : "secondary"} className="text-xs">
                    {isReady ? "Ready" : "Scheduled"}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}

        {upcomingReleases.length === 0 && !loading && (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No scheduled releases</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
