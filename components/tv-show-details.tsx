"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { WatchlistButton } from "@/components/watchlist-button"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { TVShow, Episode } from "@/lib/types"
import { Share, Heart, Calendar, Tv, Star, ExternalLink, Download, Play } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface TVShowDetailsProps {
  tvShow: TVShow
}

export function TVShowDetails({ tvShow }: TVShowDetailsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedSeason, setSelectedSeason] = useState<number>(1)

  const firstAirYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : ""
  const firstAirDate = tvShow.first_air_date ? new Date(tvShow.first_air_date).toLocaleDateString() : ""
  const lastAirDate = tvShow.last_air_date ? new Date(tvShow.last_air_date).toLocaleDateString() : ""

  // Load episodes for the TV show
  useEffect(() => {
    const loadEpisodes = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from("episodes")
          .select("*")
          .eq("tv_show_id", tvShow.id)
          .order("season_number", { ascending: true })
          .order("episode_number", { ascending: true })
        
        if (error) throw error
        setEpisodes(data || [])
      } catch (error) {
        console.error("Failed to load episodes:", error)
      }
    }

    loadEpisodes()
  }, [tvShow.id])

  // Get unique seasons
  const seasons = Array.from(new Set(episodes.map(ep => ep.season_number))).sort((a, b) => a - b)
  
  // Get episodes for selected season
  const seasonEpisodes = episodes.filter(ep => ep.season_number === selectedSeason)

  const handleLikeToggle = () => {
    setIsLiked(!isLiked)
    // TODO: Implement like functionality
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tvShow.name,
        text: tvShow.overview,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const openTrailer = () => {
    if (tvShow.trailer_url) {
      window.open(tvShow.trailer_url, "_blank")
    }
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-96 flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getTMDBImageUrl(tvShow.backdrop_path, "original")})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 pb-8">
          <div className="flex items-end gap-6">
            <img
              src={getTMDBImageUrl(tvShow.poster_path) || "/placeholder.svg?height=300&width=200"}
              alt={tvShow.name}
              className="w-48 h-72 object-cover rounded-lg shadow-2xl"
            />
            <div className="flex-1 pb-4">
              <h1 className="text-4xl font-bold text-foreground mb-2">{tvShow.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {tvShow.vote_average && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold">{tvShow.vote_average.toFixed(1)}</span>
                    <span className="text-muted-foreground">({tvShow.vote_count?.toLocaleString()} votes)</span>
                  </div>
                )}
                {firstAirYear && (
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    {firstAirYear}
                  </Badge>
                )}
                {tvShow.number_of_seasons && (
                  <Badge variant="outline" className="text-sm">
                    <Tv className="h-3 w-3 mr-1" />
                    {tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {/* Genres */}
              {Array.isArray(tvShow.genres) && tvShow.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tvShow.genres.map((genre: any) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <WatchlistButton
                  id={tvShow.id.toString()}
                  type="tv"
                  title={tvShow.name}
                  poster_path={tvShow.poster_path}
                  vote_average={tvShow.vote_average || 0}
                  first_air_date={tvShow.first_air_date}
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

                {tvShow.trailer_url && (
                  <Button onClick={openTrailer} variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}

                {tvShow.download_url && (
                  <Button asChild variant="outline">
                    <a href={tvShow.download_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{tvShow.overview}</p>

            {/* Episodes Section */}
            {episodes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Episodes</h3>
                
                {/* Season Selector */}
                {seasons.length > 1 && (
                  <div className="flex gap-2 mb-6">
                    {seasons.map((season) => (
                      <Button
                        key={season}
                        variant={selectedSeason === season ? "default" : "outline"}
                        onClick={() => setSelectedSeason(season)}
                        size="sm"
                      >
                        Season {season}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Episodes List */}
                <div className="space-y-3">
                  {seasonEpisodes.map((episode) => (
                    <Card key={episode.id} className="hover:bg-accent transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="text-xs">
                                S{episode.season_number.toString().padStart(2, '0')}E{episode.episode_number.toString().padStart(2, '0')}
                              </Badge>
                              <h4 className="font-semibold">{episode.name}</h4>
                              {episode.runtime && (
                                <span className="text-sm text-muted-foreground">{episode.runtime}min</span>
                              )}
                            </div>
                            {episode.overview && (
                              <p className="text-sm text-muted-foreground mb-2">{episode.overview}</p>
                            )}
                            {episode.air_date && (
                              <p className="text-xs text-muted-foreground">
                                Air Date: {new Date(episode.air_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/tv/${tvShow.id}/episode/${episode.id}`}>
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Link>
                            </Button>
                            {episode.download_url && (
                              <Button asChild size="sm" variant="outline">
                                <a href={episode.download_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {seasonEpisodes.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No episodes available for Season {selectedSeason}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Show Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">First Air Date:</span>
                    <span className="ml-2 text-foreground">{firstAirDate || "Unknown"}</span>
                  </div>
                  {lastAirDate && (
                    <div>
                      <span className="text-muted-foreground">Last Air Date:</span>
                      <span className="ml-2 text-foreground">{lastAirDate}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Seasons:</span>
                    <span className="ml-2 text-foreground">{tvShow.number_of_seasons || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Episodes:</span>
                    <span className="ml-2 text-foreground">{tvShow.number_of_episodes || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="ml-2 text-foreground">
                      {tvShow.vote_average ? `${tvShow.vote_average}/10` : "Not rated"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TMDB ID:</span>
                    <span className="ml-2 text-foreground">{tvShow.tmdb_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
