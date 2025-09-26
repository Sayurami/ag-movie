"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { WatchlistButton } from "@/components/watchlist-button"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Share, Heart, Calendar, Clock, Star, ExternalLink } from "lucide-react"
import { useState } from "react"

interface MovieDetailsProps {
  movie: Movie
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const [isLiked, setIsLiked] = useState(false)

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ""
  const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : ""

  const handleLikeToggle = () => {
    setIsLiked(!isLiked)
    // TODO: Implement like functionality
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const openTrailer = () => {
    if (movie.trailer_url) {
      window.open(movie.trailer_url, "_blank")
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Movie Poster */}
        <div className="lg:col-span-1">
          <img
            src={getTMDBImageUrl(movie.poster_path) || "/placeholder.svg?height=750&width=500"}
            alt={movie.title}
            className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
          />
        </div>

        {/* Movie Information */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {movie.vote_average && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({movie.vote_count?.toLocaleString()} votes)</span>
                </div>
              )}
              {releaseYear && (
                <Badge variant="outline" className="text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {releaseYear}
                </Badge>
              )}
              {movie.runtime && (
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {movie.runtime}min
                </Badge>
              )}
            </div>

            {/* Genres */}
            {Array.isArray(movie.genres) && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Overview */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <WatchlistButton
              id={movie.id.toString()}
              type="movie"
              title={movie.title}
              poster_path={movie.poster_path}
              vote_average={movie.vote_average || 0}
              release_date={movie.release_date}
              variant="outline"
              size="md"
            />

            <Button onClick={handleLikeToggle} variant={isLiked ? "default" : "outline"}>
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </Button>

            <Button onClick={handleShare} variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            {movie.trailer_url && (
              <Button onClick={openTrailer} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Watch Trailer
              </Button>
            )}
          </div>

          {/* Additional Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Release Date:</span>
                  <span className="ml-2 text-foreground">{releaseDate || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Runtime:</span>
                  <span className="ml-2 text-foreground">{movie.runtime ? `${movie.runtime} minutes` : "Unknown"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="ml-2 text-foreground">
                    {movie.vote_average ? `${movie.vote_average}/10` : "Not rated"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">TMDB ID:</span>
                  <span className="ml-2 text-foreground">{movie.tmdb_id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
