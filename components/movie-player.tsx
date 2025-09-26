"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Play, X, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"

interface MoviePlayerProps {
  movie: Movie
}

export function MoviePlayer({ movie }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original")
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ""

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handleClose = () => {
    setIsPlaying(false)
  }

  return (
    <div className="relative">
      {!isPlaying ? (
        // Movie Poster/Backdrop with Play Button
        <div className="relative h-screen flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backdropUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{movie.title}</h1>
            <div className="flex items-center justify-center gap-4 mb-8">
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
            <Button size="lg" onClick={handlePlay} className="text-xl px-12 py-6">
              <Play className="h-6 w-6 mr-3" />
              Play Movie
            </Button>
          </div>
        </div>
      ) : (
        // Video Player
        <div className={`relative ${isFullscreen ? "fixed inset-0 z-50" : "h-screen"} bg-black`}>
          {/* Player Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Embedded Video Player */}
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={movie.embed_url}
              className="w-full h-full"
              frameBorder="0"
              marginWidth={0}
              marginHeight={0}
              scrolling="no"
              allowFullScreen
              title={movie.title}
            />
          </div>
        </div>
      )}
    </div>
  )
}
