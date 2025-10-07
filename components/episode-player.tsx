"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading"
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
  const [mounted, setMounted] = useState(false)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [autoNextEnabled, setAutoNextEnabled] = useState(false)
  const [nextEpisodeTimer, setNextEpisodeTimer] = useState(10)
  const [videoEnded, setVideoEnded] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handleClose = () => {
    setIsPlaying(false)
    setVideoEnded(false)
    setShowNextEpisode(false)
  }

  // Auto-next functionality
  useEffect(() => {
    if (isPlaying && nextEpisode && autoNextEnabled) {
      const timer = setInterval(() => {
        setNextEpisodeTimer((prev) => {
          if (prev <= 1) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
              onNextEpisode?.()
            }, 0)
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPlaying, nextEpisode, autoNextEnabled, onNextEpisode])

  // Show next episode after 5 minutes
  useEffect(() => {
    if (isPlaying && nextEpisode) {
      const timer = setTimeout(() => {
        setShowNextEpisode(true)
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [isPlaying, nextEpisode])

  // Handle video end detection
  useEffect(() => {
    if (videoEnded && nextEpisode && autoNextEnabled) {
      const timer = setInterval(() => {
        setNextEpisodeTimer((prev) => {
          if (prev <= 1) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
              onNextEpisode?.()
            }, 0)
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else if (videoEnded && nextEpisode) {
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
          if (event.data.includes('ended') || event.data.includes('complete')) {
            setVideoEnded(true)
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="text-white" />
          <div className="text-white text-lg animate-fade-in">Loading Episode...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {!isPlaying ? (
        // Episode Info with Play Button
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6">
            <Link href={`/tv/${tvShow.id}`}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {tvShow.name}
              </Button>
            </Link>
          </div>

          {/* Episode Content */}
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* TV Show Thumbnail */}
              <div className="lg:col-span-1">
                <div className="relative">
                  <img
                    src={getTMDBImageUrl(tvShow.backdrop_path || tvShow.poster_path || "", "w780") || "/placeholder.svg"}
                    alt={tvShow.name}
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-2xl animate-fade-in"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg" />
                  
                  {/* Episode Info Overlay - Only show if episode has a still image */}
                  {episode.still_path && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm rounded-lg p-3 animate-slide-in-left">
                        <img
                          src={getTMDBImageUrl(episode.still_path, "w92")}
                          alt={episode.name}
                          className="w-12 h-16 object-cover rounded-md hover-scale"
                        />
                        <div className="text-white">
                          <h3 className="font-semibold text-sm truncate max-w-32">{episode.name}</h3>
                          <p className="text-xs text-gray-300">S{episode.season_number}E{episode.episode_number}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Episode Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* TV Show Info */}
                <div className="flex items-center gap-4 mb-6 animate-stagger-2">
                  <img
                    src={getTMDBImageUrl(tvShow.poster_path || "", "w154") || "/placeholder.svg"}
                    alt={tvShow.name}
                    className="w-16 h-20 object-cover rounded-lg shadow-lg hover-scale"
                  />
                  <div>
                    <Link href={`/tv/${tvShow.id}`} className="hover:text-primary transition-colors">
                      <h2 className="text-xl font-bold text-white hover:text-primary">{tvShow.name}</h2>
                    </Link>
                    <p className="text-gray-400 text-sm">
                      {tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : ""}
                      {tvShow.vote_average && ` • ★ ${tvShow.vote_average.toFixed(1)}`}
                    </p>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-hero-text">
                    {episode.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-4 flex-wrap animate-stagger-3">
                    <Badge variant="secondary" className="text-sm hover-scale">
                      S{episode.season_number}E{episode.episode_number}
                    </Badge>
                    {episode.air_date && (
                      <Badge variant="outline" className="text-sm hover-scale">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(episode.air_date).toLocaleDateString()}
                      </Badge>
                    )}
                    {episode.runtime && (
                      <Badge variant="outline" className="text-sm hover-scale">
                        <Clock className="h-3 w-3 mr-1" />
                        {episode.runtime}min
                      </Badge>
                    )}
                  </div>
                </div>

                {episode.overview && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                    <p className="text-gray-300 leading-relaxed">{episode.overview}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap animate-stagger-4">
                  <Button 
                    size="lg" 
                    onClick={handlePlay}
                    className="bg-primary hover:bg-primary/90 text-lg font-semibold px-8 py-3 hover-lift btn-primary-animated animate-play-button"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Play Episode
                  </Button>
                  
                  {episode.download_links && episode.download_links.length > 0 && (
                    <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-black hover-lift">
                      <Download className="h-5 w-5 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
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

          {/* TV Show Info Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm rounded-lg p-3 animate-slide-in-left">
              <img
                src={getTMDBImageUrl(tvShow.poster_path || "", "w154") || "/placeholder.svg"}
                alt={tvShow.name}
                className="w-10 h-12 object-cover rounded-md hover-scale"
              />
              <div className="text-white">
                <h3 className="font-semibold text-sm truncate max-w-24">{tvShow.name}</h3>
                <p className="text-xs text-gray-300">S{episode.season_number}E{episode.episode_number}</p>
              </div>
            </div>
          </div>

          {/* Auto-next Settings */}
          {nextEpisode && (
            <div className="absolute top-4 left-32 z-10">
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

          {/* Next Episode Popup */}
          {showNextEpisode && nextEpisode && (
            <div className="absolute bottom-8 right-8 z-10 max-w-md">
              <div className="bg-black/90 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={getTMDBImageUrl(nextEpisode.still_path || "", "w154") || "/placeholder.svg"}
                      alt={nextEpisode.name}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    {/* TV Show thumbnail overlay */}
                    <div className="absolute -bottom-1 -right-1">
                      <img
                        src={getTMDBImageUrl(tvShow.poster_path || "", "w92") || "/placeholder.svg"}
                        alt={tvShow.name}
                        className="w-8 h-10 object-cover rounded border-2 border-white"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-lg mb-1">{nextEpisode.name}</h4>
                    <p className="text-sm text-gray-300 mb-1">
                      S{nextEpisode.season_number}E{nextEpisode.episode_number}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">{tvShow.name}</p>
                    {videoEnded && (
                      <p className="text-sm text-yellow-400 font-semibold">Episode Finished - Ready for Next</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    onClick={onNextEpisode}
                    className="flex-1 bg-primary hover:bg-primary/90 text-base font-semibold py-3"
                  >
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Play Next Episode
                  </Button>
                  
                  {(autoNextEnabled || videoEnded) && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg">
                      <RotateCcw className="h-4 w-4" />
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
                  className="absolute top-3 right-3 h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={episode.embed_url}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              title={episode.name}
              onLoad={() => {
                console.log('Episode video loaded successfully')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}