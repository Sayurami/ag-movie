"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { WatchlistButton } from "@/components/watchlist-button"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Share, Heart, Calendar, Clock, Star, ExternalLink, Download, Play, Mic } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface MovieDetailsProps {
  movie: Movie
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [movieParts, setMovieParts] = useState<Movie[]>([])

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ""
  const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : ""

  // Load movie parts if this is a multi-part movie
  useEffect(() => {
    const loadMovieParts = async () => {
      const supabase = createClient()
      try {
        let query = supabase.from("movies").select("*")
        
        if (movie.parent_movie_id) {
          // This is a part of another movie, get all parts including parent
          query = query.or(`parent_movie_id.eq.${movie.parent_movie_id},id.eq.${movie.parent_movie_id}`)
        } else if (movie.part_number && movie.part_number === 1) {
          // This is Part 1, get all its parts
          query = query.or(`parent_movie_id.eq.${movie.id},id.eq.${movie.id}`)
        } else {
          // This is a standalone movie, no parts to load
          return
        }
        
        const { data: parts, error } = await query.order("part_number", { ascending: true })
        
        if (error) throw error
        setMovieParts(parts || [])
      } catch (error) {
        console.error("Failed to load movie parts:", error)
      }
    }

    // Load parts for multi-part movies
    if (movie.parent_movie_id || (movie.part_number && movie.part_number >= 1)) {
      loadMovieParts()
    }
  }, [movie.id, movie.parent_movie_id, movie.part_number])

  // Debug logging
  console.log("Movie Details Debug:", {
    title: movie.title,
    download_url: movie.download_url,
    hasDownloadUrl: !!movie.download_url,
    part_number: movie.part_number,
    parent_movie_id: movie.parent_movie_id,
    movieParts: movieParts.length
  })

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
    <div className="container mx-auto px-4 py-6 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Movie Poster */}
        <div className="lg:col-span-1">
          <img
            src={getTMDBImageUrl(movie.poster_path) || "/placeholder.svg?height=750&width=500"}
            alt={movie.title}
            className="w-full max-w-sm sm:max-w-md mx-auto rounded-lg shadow-2xl"
          />
        </div>

        {/* Movie Information */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
              {movie.vote_average && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current" />
                  <span className="text-base sm:text-lg font-semibold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">({movie.vote_count?.toLocaleString()} votes)</span>
                </div>
              )}
              {releaseYear && (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {releaseYear}
                </Badge>
              )}
              {movie.runtime && (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {movie.runtime}min
                </Badge>
              )}
            </div>

            {/* Genres */}
            {Array.isArray(movie.genres) && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {movie.genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs sm:text-sm">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Narrator */}
            {movie.narrator && (
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Mic className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-muted-foreground">Narrated by:</span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {movie.narrator}
                </Badge>
              </div>
            )}
          </div>

          {/* Overview */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Overview</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{movie.overview}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <WatchlistButton
              id={movie.id.toString()}
              type="movie"
              title={movie.title}
              poster_path={movie.poster_path}
              vote_average={movie.vote_average || 0}
              release_date={movie.release_date}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            />

            <Button onClick={handleLikeToggle} variant={isLiked ? "default" : "outline"} size="sm" className="text-xs sm:text-sm">
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </Button>

            <Button onClick={handleShare} variant="outline" size="sm" className="text-xs sm:text-sm">
              <Share className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Share
            </Button>

            {movie.trailer_url && (
              <Button onClick={openTrailer} variant="outline" size="sm" className="text-xs sm:text-sm">
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Trailer
              </Button>
            )}

            {movie.download_url && (
              <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                <a href={movie.download_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Download
                </a>
              </Button>
            )}
          </div>

          {/* Movie Parts */}
          {movieParts.length > 1 && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
                  Movie Parts ({movieParts.length} parts)
                </h3>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {movieParts.map((part) => (
                    <div
                      key={part.id}
                      className={`p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors ${
                        part.id === movie.id ? 'ring-2 ring-primary bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img
                          src={getTMDBImageUrl(part.poster_path, "w92") || "/placeholder.svg"}
                          alt={part.title}
                          className="w-12 h-16 sm:w-16 sm:h-24 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm truncate">{part.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Part {part.part_number}
                            {part.id === movie.id && " (Current)"}
                          </p>
                          {part.runtime && (
                            <p className="text-xs text-muted-foreground">
                              {part.runtime} min
                            </p>
                          )}
                          <div className="flex gap-1 sm:gap-2 mt-1 sm:mt-2">
                            <Button asChild size="sm" variant="outline" className="text-xs">
                              <Link href={`/movie/${part.id}`}>
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Link>
                            </Button>
                            {part.download_url && (
                              <Button asChild size="sm" variant="outline" className="text-xs">
                                <a href={part.download_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Details */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
                {movie.part_number && (
                  <div>
                    <span className="text-muted-foreground">Part:</span>
                    <span className="ml-2 text-foreground">{movie.part_number}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
