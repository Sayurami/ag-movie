"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MovieActionButtons } from "@/components/movie-action-buttons"
import { LoadingSpinner } from "@/components/ui/loading"
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
  const [mounted, setMounted] = useState(false)
  const [showNextMovie, setShowNextMovie] = useState(false)
  const [autoNextEnabled, setAutoNextEnabled] = useState(false)
  const [nextMovieTimer, setNextMovieTimer] = useState(10)
  const [videoEnded, setVideoEnded] = useState(false)

  const backdropUrl = getTMDBImageUrl(movie.backdrop_path || "", "original")
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ""

  // Simple mobile detection without hooks
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

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
    setShowNextMovie(false)
  }

  // Auto-next functionality
  useEffect(() => {
    if (isPlaying && nextMovie && autoNextEnabled) {
      const timer = setInterval(() => {
        setNextMovieTimer((prev) => {
          if (prev <= 1) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
              onNextMovie?.()
            }, 0)
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPlaying, nextMovie, autoNextEnabled, onNextMovie])

  // Show next movie after 5 minutes
  useEffect(() => {
    if (isPlaying && nextMovie) {
      const timer = setTimeout(() => {
        setShowNextMovie(true)
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [isPlaying, nextMovie])

  // Handle video end detection
  useEffect(() => {
    if (videoEnded && nextMovie && autoNextEnabled) {
      const timer = setInterval(() => {
        setNextMovieTimer((prev) => {
          if (prev <= 1) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
              onNextMovie?.()
            }, 0)
            return 10
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else if (videoEnded && nextMovie) {
      setShowNextMovie(true)
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
    console.log("Liked movie:", movie.title)
  }

  if (!mounted) {
    return (
      <div className="relative h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="text-white" />
          <div className="text-white text-lg animate-fade-in">Loading Movie...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {!isPlaying ? (
        // Movie Background with Play Button
        <div className="relative h-screen flex items-center justify-center">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
            style={{
              backgroundImage: `url(${backdropUrl})`,
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content */}
          <div className="relative z-10 text-center px-4">
            <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 animate-hero-text">
              {movie.title}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-8 flex-wrap animate-stagger-2">
              {movie.vote_average && (
                <Badge variant="secondary" className="text-sm hover-scale">
                  ★ {movie.vote_average.toFixed(1)}
                </Badge>
              )}
              {releaseYear && (
                <Badge variant="outline" className="text-sm hover-scale">
                  {releaseYear}
                </Badge>
              )}
              {movie.runtime && (
                <Badge variant="outline" className="text-sm hover-scale">
                  {movie.runtime}min
                </Badge>
              )}
            </div>
            <div className="animate-stagger-3">
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
        <div className={`relative ${isFullscreen ? "fixed inset-0 z-50" : "h-screen"} bg-black movie-player-enter`}>
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

          {/* Next Movie Popup */}
          {showNextMovie && nextMovie && (
            <div className="absolute bottom-8 right-8 z-10 max-w-md">
              <div className="bg-black/90 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={getTMDBImageUrl(nextMovie.poster_path || "", "w154") || "/placeholder.svg"}
                    alt={nextMovie.title}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-lg mb-1">{nextMovie.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {nextMovie.release_date ? new Date(nextMovie.release_date).getFullYear() : ""}
                    </p>
                    {videoEnded && (
                      <p className="text-sm text-yellow-400 font-semibold">Video Finished - Ready for Next</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    onClick={onNextMovie}
                    className="flex-1 bg-primary hover:bg-primary/90 text-base font-semibold py-3"
                  >
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Play Next Movie
                  </Button>
                  
                  {(autoNextEnabled || videoEnded) && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg">
                      <RotateCcw className="h-4 w-4" />
                      {nextMovieTimer}s
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowNextMovie(false)
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
              src={movie.embed_url}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              title={movie.title}
              onLoad={() => {
                console.log('Video loaded successfully')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}