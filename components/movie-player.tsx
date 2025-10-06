"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RedirectBack } from "@/components/redirect-back"
import { MovieActionButtons } from "@/components/movie-action-buttons"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Play, X, Volume2, VolumeX, Maximize, Minimize, ChevronRight, Settings, RotateCcw } from "lucide-react"

interface MoviePlayerProps {
  movie: Movie
  nextMovie?: Movie
  onNextMovie?: () => void
}

export function MoviePlayer({ movie, nextMovie, onNextMovie }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [autoNextEnabled, setAutoNextEnabled] = useState(false)
  const [nextEpisodeTimer, setNextEpisodeTimer] = useState(10)
  const [videoEnded, setVideoEnded] = useState(false)

  const backdropUrl = getTMDBImageUrl(movie.backdrop_path || "", "original")
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ""

  // Convert YouTube URL to embed format with minimal UI
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url || !mounted) return ""
    const videoId = url.includes('youtube.com/watch?v=') 
      ? url.split('v=')[1]?.split('&')[0]
      : url.includes('youtu.be/')
      ? url.split('/').pop()?.split('?')[0]
      : null
    
    if (videoId) {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&cc_load_policy=0&iv_load_policy=3&disablekb=1&fs=0&start=0&enablejsapi=1&playsinline=1&widget_referrer=null&origin=${origin}`
    }
    return ""
  }

  const trailerEmbedUrl = movie.trailer_url ? getYouTubeEmbedUrl(movie.trailer_url) : ""

  // Debug log to check trailer data
  useEffect(() => {
    if (movie.trailer_url) {
      console.log("Trailer URL:", movie.trailer_url)
      console.log("Embed URL:", trailerEmbedUrl)
    } else {
      console.log("No trailer URL available for movie:", movie.title)
    }
  }, [movie.trailer_url, trailerEmbedUrl, movie.title])

  const handlePlay = () => {
    setIsPlaying(true)
    setIsTrailerPlaying(false) // Stop trailer when main movie starts
    setVideoLoaded(false) // Reset video loaded state
  }

  const handleClose = () => {
    setIsPlaying(false)
    setIsTrailerPlaying(true) // Resume trailer when movie stops
    setVideoLoaded(false) // Reset video loaded state
  }

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-next functionality
  useEffect(() => {
    if (isPlaying && nextMovie && autoNextEnabled) {
      const timer = setInterval(() => {
        setNextEpisodeTimer((prev) => {
          if (prev <= 1) {
            onNextMovie?.()
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPlaying, nextMovie, autoNextEnabled, onNextMovie])

  // Show next episode hover after 5 minutes of playing
  useEffect(() => {
    if (isPlaying && nextMovie) {
      const timer = setTimeout(() => {
        setShowNextEpisode(true)
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [isPlaying, nextMovie])

  // Handle video end detection and automatic redirect
  useEffect(() => {
    if (videoEnded && nextMovie && autoNextEnabled) {
      // Start countdown for automatic redirect
      const timer = setInterval(() => {
        setNextEpisodeTimer((prev) => {
          if (prev <= 1) {
            onNextMovie?.()
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else if (videoEnded && nextMovie) {
      // Show next episode card when video ends
      setShowNextEpisode(true)
    }
  }, [videoEnded, nextMovie, autoNextEnabled, onNextMovie])

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

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log("Liked movie:", movie.title)
  }

  return (
    <div className="relative">
      {/* Redirect back system - only active when movie is playing */}
      {isPlaying && (
        <RedirectBack 
          redirectDelay={5} // 5 seconds delay
          redirectUrl={`/movie/${movie.id}`} // Redirect back to movie page
        />
      )}
      
      {!isPlaying ? (
        // Movie Trailer Background with Play Button
        <div className="relative h-screen flex items-center justify-center">
          {/* Background thumbnail - always visible as loader */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${backdropUrl})`,
              opacity: trailerEmbedUrl && isTrailerPlaying ? (videoLoaded ? 0.3 : 1) : 1,
            }}
          />

          {/* YouTube trailer embed - hidden until loaded */}
          {trailerEmbedUrl && isTrailerPlaying && mounted && (
            <iframe
              className="absolute inset-0 w-full h-full transition-opacity duration-1000"
              src={trailerEmbedUrl}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={`${movie.title} Trailer`}
              style={{
                opacity: videoLoaded ? 1 : 0,
              }}
              onLoad={() => {
                // Video loaded, start fade transition
                setTimeout(() => setVideoLoaded(true), 500)
              }}
              onError={() => {
                // Fallback to backdrop image if trailer fails to load
                setIsTrailerPlaying(false)
                setVideoLoaded(true)
              }}
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />


          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in animate-stagger-1">{movie.title}</h1>
            <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in animate-stagger-2">
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
            <div className="animate-fade-in animate-stagger-3">
              <MovieActionButtons 
                movie={movie} 
                onPlay={handlePlay}
                onLike={handleLike}
                isLiked={false}
              />
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

          {/* Auto-next Settings */}
          {nextMovie && (
            <div className="absolute top-4 left-4 z-10">
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
          {showNextEpisode && nextMovie && (
            <div className="absolute bottom-4 right-4 z-10 max-w-sm">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={getTMDBImageUrl(nextMovie.poster_path || "", "w92") || "/placeholder.svg"}
                    alt={nextMovie.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{nextMovie.title}</h4>
                    <p className="text-xs text-gray-300">
                      {nextMovie.release_date ? new Date(nextMovie.release_date).getFullYear() : ""}
                    </p>
                    {videoEnded && (
                      <p className="text-xs text-yellow-400 font-medium">Video Finished</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={onNextMovie}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    {videoEnded ? "Play Next" : "Play Next"}
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
                Test Video End
              </Button>
            </div>
          )}

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
              onLoad={() => {
                // Try to detect video end through various methods
                const iframe = document.querySelector('iframe')
                if (iframe) {
                  // Listen for iframe messages
                  iframe.addEventListener('load', () => {
                    // Additional video end detection logic can be added here
                    console.log('Video iframe loaded')
                  })
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
