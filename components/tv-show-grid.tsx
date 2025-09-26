"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { TVShow } from "@/lib/types"
import { Play, Plus } from "lucide-react"
import Link from "next/link"

interface TVShowGridProps {
  tvShows: TVShow[]
}

export function TVShowGrid({ tvShows }: TVShowGridProps) {
  if (tvShows.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-foreground mb-2">No TV Shows Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {tvShows.map((show) => (
        <div key={show.id} className="group">
          <div className="relative overflow-hidden rounded-lg bg-card">
            <img
              src={getTMDBImageUrl(show.poster_path) || "/placeholder.svg?height=360&width=240"}
              alt={show.name}
              className="w-full h-80 object-cover transition-transform group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/tv/${show.id}`}>
                    <Play className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rating Badge */}
            {show.vote_average && (
              <Badge className="absolute top-2 right-2 text-xs">★ {show.vote_average.toFixed(1)}</Badge>
            )}
          </div>

          <div className="mt-3">
            <h3 className="font-semibold text-foreground text-sm truncate">{show.name}</h3>
            <p className="text-xs text-muted-foreground">
              {show.first_air_date ? new Date(show.first_air_date).getFullYear() : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
