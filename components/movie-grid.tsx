"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Play, Plus } from "lucide-react"
import Link from "next/link"
import { MovieGridSkeleton } from "@/components/skeletons/movie-grid-skeleton"

interface MovieGridProps {
  movies: Movie[]
  loading?: boolean
}

export function MovieGrid({ movies, loading }: MovieGridProps) {
  if (loading) {
    return <MovieGridSkeleton count={12} />
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-foreground mb-2">No Movies Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
      {movies.map((movie) => (
        <Link key={movie.id} href={`/movie/${movie.id}`} className="group cursor-pointer">
          <div className="relative overflow-hidden rounded-lg bg-card">
            <img
              src={getTMDBImageUrl(movie.poster_path) || "/placeholder.svg?height=360&width=240"}
              alt={movie.title}
              className="w-full h-48 sm:h-64 md:h-80 object-cover transition-transform group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button asChild size="sm" onClick={(e) => e.preventDefault()}>
                  <Link href={`/movie/${movie.id}`}>
                    <Play className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" onClick={(e) => e.stopPropagation()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rating Badge */}
            {movie.vote_average && (
              <Badge className="absolute top-2 right-2 text-xs">★ {movie.vote_average.toFixed(1)}</Badge>
            )}
          </div>

          <div className="mt-2 md:mt-3">
            <h3 className="font-semibold text-foreground text-xs md:text-sm truncate">{movie.title}</h3>
            <p className="text-xs text-muted-foreground">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
