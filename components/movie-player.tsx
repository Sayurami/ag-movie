"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RedirectBack } from "@/components/redirect-back"
import { MovieRoomCreator } from "@/components/movie-room-creator"
import { MovieRoomJoiner } from "@/components/movie-room-joiner"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Play, X, Volume2, VolumeX, Maximize, Minimize, Download, ExternalLink } from "lucide-react"

interface MoviePlayerProps {
  movie: Movie
}

export function MoviePlayer({ movie }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

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
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-fade-in animate-stagger-3">
              <Button size="lg" onClick={handlePlay} className="text-xl px-12 py-6 hover-lift animate-pulse-hover">
                <Play className="h-6 w-6 mr-3" />
                Play Movie
              </Button>
              
              {movie.download_url && (
                <Button size="lg" variant="outline" asChild className="text-xl px-12 py-6">
                  <a href={movie.download_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-6 w-6 mr-3" />
                    Download
                  </a>
                </Button>
              )}
              
              {movie.trailer_url && (
                <Button size="lg" variant="outline" asChild className="text-xl px-12 py-6">
                  <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-6 w-6 mr-3" />
                    Watch Trailer
                  </a>
                </Button>
              )}
            </div>
            
            {/* Movie Room Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6 animate-fade-in animate-stagger-4">
              <MovieRoomCreator movie={movie} />
              <MovieRoomJoiner />
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
