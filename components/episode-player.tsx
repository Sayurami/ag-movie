"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { RedirectBack } from "@/components/redirect-back"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Episode, TVShow } from "@/lib/types"
import { Play, X, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, Calendar, Clock, Download, ExternalLink, ChevronRight, Settings, RotateCcw } from "lucide-react"
import Link from "next/link"

interface EpisodePlayerProps {
  episode: Episode
  tvShow: TVShow
  nextEpisode?: Episode
  onNextEpisode?: () => void
}

export function EpisodePlayer({ episode, tvShow, nextEpisode, onNextEpisode }: EpisodePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [autoNextEnabled, setAutoNextEnabled] = useState(false)
  const [nextEpisodeTimer, setNextEpisodeTimer] = useState(10)
  const [videoEnded, setVideoEnded] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handleClose = () => {
    setIsPlaying(false)
  }

  // Auto-next functionality
  useEffect(() => {
    if (isPlaying && nextEpisode && autoNextEnabled) {
      const timer = setInterval(() => {
        setNextEpisodeTimer((prev) => {
          if (prev <= 1) {
            onNextEpisode?.()
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPlaying, nextEpisode, autoNextEnabled, onNextEpisode])

  // Show next episode hover after 5 minutes of playing
  useEffect(() => {
    if (isPlaying && nextEpisode) {
      const timer = setTimeout(() => {
        setShowNextEpisode(true)
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [isPlaying, nextEpisode])

  // Handle video end detection and automatic redirect
  useEffect(() => {
    if (videoEnded && nextEpisode && autoNextEnabled) {
      // Start countdown for automatic redirect
      const timer = setInterval(() => {
        setNextEpisodeTimer((prev) => {
          if (prev <= 1) {
            onNextEpisode?.()
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else if (videoEnded && nextEpisode) {
      // Show next episode card when video ends
      setShowNextEpisode(true)
    }
  }, [videoEnded, nextEpisode, autoNextEnabled, onNextEpisode])

  // Listen for video end events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data)
          if (data.event === 'video-ended' || data.event === 'ended') {
            setVideoEnded(true)
          }
        } catch (e) {
          // Handle non-JSON messages
          if (event.data.includes('ended') || event.data.includes('complete')) {
            setVideoEnded(true)
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Redirect back system - only active when episode is playing */}
      {isPlaying && (
        <RedirectBack 
          redirectDelay={5} // 5 seconds delay
          redirectUrl={`/tv/${tvShow.id}/episode/${episode.id}`} // Redirect back to episode page
        />
      )}
      
      {!isPlaying ? (
        // Episode Details with Play Button
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button asChild variant="outline">
              <Link href={`/tv/${tvShow.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {tvShow.name}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Episode Still/Poster */}
            <div className="lg:col-span-1">
              <div className="relative">
                <img
                  src={getTMDBImageUrl(episode.still_path, "w500") || "/placeholder.svg?height=300&width=500"}
                  alt={episode.name}
                  className="w-full rounded-lg shadow-lg"
                />
                <div 
                  className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${getTMDBImageUrl(tvShow.poster_path, "w500")})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Button size="lg" onClick={handlePlay} className="text-xl px-8 py-4 bg-primary/90 hover:bg-primary backdrop-blur-sm">
                      <Play className="h-6 w-6 mr-3" />
                      Play Episode
                    </Button>
                    
                    {episode.download_url && (
                      <Button size="lg" variant="outline" asChild className="text-xl px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 text-white">
                        <a href={episode.download_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-6 w-6 mr-3" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Episode Information */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  S{episode.season_number}E{episode.episode_number}: {episode.name}
                </h1>
                <h2 className="text-xl text-muted-foreground mb-4">{tvShow.name}</h2>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {episode.vote_average && (
                    <Badge variant="secondary" className="text-sm">
                      ★ {episode.vote_average.toFixed(1)}
                    </Badge>
                  )}
                  {episode.air_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(episode.air_date).toLocaleDateString()}
                    </div>
                  )}
                  {episode.runtime && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {episode.runtime}min
                    </div>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Episode Overview</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{episode.overview}</p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {episode.download_url && (
                    <Button asChild variant="outline">
                      <a href={episode.download_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download Episode
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Episode Details Card */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4">Episode Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Season:</span>
                      <span className="ml-2 text-foreground">{episode.season_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Episode:</span>
                      <span className="ml-2 text-foreground">{episode.episode_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Air Date:</span>
                      <span className="ml-2 text-foreground">
                        {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="ml-2 text-foreground">
                        {episode.runtime ? `${episode.runtime} minutes` : "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="ml-2 text-foreground">
                        {episode.vote_average ? `${episode.vote_average}/10` : "Not rated"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TMDB ID:</span>
                      <span className="ml-2 text-foreground">{episode.tmdb_id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

          {/* Episode Info Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-black/80 rounded-lg p-3">
            <h3 className="text-white font-semibold">
              {tvShow.name} - S{episode.season_number}E{episode.episode_number}
            </h3>
            <p className="text-white/80 text-sm">{episode.name}</p>
          </div>

          {/* Auto-next Settings */}
          {nextEpisode && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setAutoNextEnabled(!autoNextEnabled)}
                className={autoNextEnabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Settings className="h-4 w-4 mr-2" />
                Auto-next: {autoNextEnabled ? "ON" : "OFF"}
              </Button>
            </div>
          )}

          {/* Next Episode Hover */}
          {showNextEpisode && nextEpisode && (
            <div className="absolute bottom-4 right-4 z-10 max-w-sm">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={getTMDBImageUrl(nextEpisode.still_path || "", "w92") || "/placeholder.svg"}
                    alt={nextEpisode.name}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{nextEpisode.name}</h4>
                    <p className="text-xs text-gray-300">
                      S{nextEpisode.season_number}E{nextEpisode.episode_number}
                    </p>
                    {videoEnded && (
                      <p className="text-xs text-yellow-400 font-medium">Episode Finished</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={onNextEpisode}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Play Next
                  </Button>
                  
                  {(autoNextEnabled || videoEnded) && (
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <RotateCcw className="h-3 w-3" />
                      {nextEpisodeTimer}s
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowNextEpisode(false)
                    setVideoEnded(false)
                  }}
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Manual Video End Button for Testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute bottom-4 left-4 z-10">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setVideoEnded(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Test Episode End
              </Button>
            </div>
          )}

          {/* Embedded Video Player */}
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={episode.embed_url}
              className="w-full h-full"
              frameBorder="0"
              marginWidth={0}
              marginHeight={0}
              scrolling="no"
              allowFullScreen
              title={`${tvShow.name} - ${episode.name}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
