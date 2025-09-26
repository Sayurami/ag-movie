"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie, TVShow } from "@/lib/types"
import { Calendar, Clock, Film, Tv, Bell, ExternalLink } from "lucide-react"
import { useState } from "react"

interface ComingSoonGridProps {
  items: ((Movie | TVShow) & { type: "movie" | "tv_show" })[]
}

export function ComingSoonGrid({ items }: ComingSoonGridProps) {
  const [notifyItems, setNotifyItems] = useState<Set<string>>(new Set())

  const handleNotifyToggle = (itemId: string) => {
    const newNotifyItems = new Set(notifyItems)
    if (newNotifyItems.has(itemId)) {
      newNotifyItems.delete(itemId)
    } else {
      newNotifyItems.add(itemId)
    }
    setNotifyItems(newNotifyItems)
    // TODO: Implement actual notification system
  }

  const getTimeUntilRelease = (scheduledRelease: string | null) => {
    if (!scheduledRelease) return null

    const now = new Date()
    const releaseDate = new Date(scheduledRelease)
    const diffTime = releaseDate.getTime() - now.getTime()

    if (diffTime <= 0) return "Available now"

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`
    return `${Math.ceil(diffDays / 365)} years`
  }

  const openTrailer = (item: Movie | TVShow) => {
    if (item.trailer_url) {
      window.open(item.trailer_url, "_blank")
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Releases</h3>
        <p className="text-muted-foreground">Check back later for new movies and TV shows coming soon!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const isMovie = item.type === "movie"
        const title = isMovie ? (item as Movie).title : (item as TVShow).name
        const releaseDate = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date
        const timeUntilRelease = getTimeUntilRelease(item.scheduled_release)
        const isNotifying = notifyItems.has(item.id)

        return (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Poster */}
                <div className="md:w-48 flex-shrink-0">
                  <img
                    src={getTMDBImageUrl(item.poster_path) || "/placeholder.svg?height=288&width=192"}
                    alt={title}
                    className="w-full h-64 md:h-72 object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {isMovie ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                          {isMovie ? "Movie" : "TV Show"}
                        </Badge>
                        {item.vote_average && <Badge variant="secondary">★ {item.vote_average.toFixed(1)}</Badge>}
                      </div>

                      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>

                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                        {item.scheduled_release && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(item.scheduled_release).toLocaleDateString()}</span>
                          </div>
                        )}
                        {timeUntilRelease && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{timeUntilRelease}</span>
                          </div>
                        )}
                        {releaseDate && <span>Original: {new Date(releaseDate).getFullYear()}</span>}
                      </div>

                      {/* Genres */}
                      {Array.isArray(item.genres) && item.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.genres.slice(0, 3).map((genre: any) => (
                            <Badge key={genre.id} variant="secondary" className="text-xs">
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-muted-foreground leading-relaxed line-clamp-3">{item.overview}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-6">
                      <Button
                        onClick={() => handleNotifyToggle(item.id)}
                        variant={isNotifying ? "default" : "outline"}
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        <Bell className={`h-4 w-4 mr-2 ${isNotifying ? "fill-current" : ""}`} />
                        {isNotifying ? "Notifying" : "Notify Me"}
                      </Button>

                      {item.trailer_url && (
                        <Button onClick={() => openTrailer(item)} variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Trailer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Release Status */}
                  {item.scheduled_release && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {timeUntilRelease === "Available now" ? "🎉 Now Available!" : `⏰ ${timeUntilRelease}`}
                        </span>
                        {timeUntilRelease === "Available now" && (
                          <Badge variant="default" className="bg-green-600">
                            Watch Now
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
