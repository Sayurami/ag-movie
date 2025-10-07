"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading"
import { FallbackVideoPlayer } from "@/components/fallback-video-player"
import { Play, X, Volume2, VolumeX, Maximize, Minimize, RefreshCw } from "lucide-react"

interface MobileVideoPlayerProps {
  src: string
  title: string
  poster?: string
  onClose?: () => void
}

export function MobileVideoPlayer({ src, title, poster, onClose }: MobileVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showFallback, setShowFallback] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    // Reset states when src changes
    setIsPlaying(false)
    setIsLoading(true)
    setHasError(false)
    setRetryCount(0)
    setShowFallback(false)
  }, [src])

  const handlePlay = () => {
    setIsPlaying(true)
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    // Show fallback after 1 failed attempt
    if (retryCount >= 1) {
      setShowFallback(true)
    }
  }

  const handleRetry = () => {
    setHasError(false)
    setIsLoading(true)
    setRetryCount(prev => prev + 1)
    setShowFallback(false)
    
    // Simple reload without forcing src change
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleClose = () => {
    setIsPlaying(false)
    onClose?.()
  }

  // Mobile-optimized iframe attributes
  const iframeProps = {
    ref: iframeRef,
    src: src,
    title: title,
    frameBorder: "0",
    allowFullScreen: true,
    allow: "autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope",
    style: {
      width: '100%',
      height: '100%',
      border: 'none',
      outline: 'none',
      ...(isMobile && {
        minHeight: '200px',
        maxHeight: '100vh'
      })
    },
    onLoad: handlePlay,
    onError: handleError
  }

  if (hasError && showFallback) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <FallbackVideoPlayer
            src={src}
            title={title}
            onRetry={handleRetry}
          />
        </div>
        
        {/* Close Button */}
        {onClose && (
          <Button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-gray-600"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      style={{
        ...(isMobile && {
          padding: '0',
          alignItems: 'stretch'
        })
      }}
    >
      {/* Close Button */}
      {onClose && (
        <Button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-gray-600"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <LoadingSpinner size="lg" className="text-white mb-4" />
            <p className="text-lg">Loading video...</p>
          </div>
        </div>
      )}

      {/* Video Player */}
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          ...(isMobile && {
            width: '100vw',
            height: '100vh',
            maxWidth: '100%',
            maxHeight: '100%'
          })
        }}
      >
        <iframe {...iframeProps} />
      </div>
    </div>
  )
}
