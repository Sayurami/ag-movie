"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Play, Plus, Info } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  movie: Movie
}

export function HeroSection({ movie }: HeroSectionProps) {
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original")
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ""

  return (
    <div className="relative h-screen flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backdropUrl})`,
        }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-32 hero-gradient-bottom" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 text-balance">{movie.title}</h1>

          <div className="flex items-center gap-4 mb-6">
            {movie.vote_average && (
              <Badge variant="secondary" className="text-sm">
                ★ {movie.vote_average.toFixed(1)}
              </Badge>
            )}
            {releaseYear && (
              <Badge variant="outline" className="text-sm">
                {releaseYear}
              </Badge>
            )}
            {movie.runtime && (
              <Badge variant="outline" className="text-sm">
                {movie.runtime}min
              </Badge>
            )}
          </div>

          <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">{movie.overview}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href={`/movie/${movie.id}`}>
                <Play className="h-5 w-5 mr-2" />
                Play Now
              </Link>
            </Button>

            <Button variant="secondary" size="lg" className="text-lg px-8">
              <Plus className="h-5 w-5 mr-2" />
              Add to List
            </Button>

            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Info className="h-5 w-5 mr-2" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
