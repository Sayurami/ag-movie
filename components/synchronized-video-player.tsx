"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface SynchronizedVideoPlayerProps {
  embedUrl: string
  isHost: boolean
  roomId: string
  onPlaybackUpdate: (position: number, isPlaying: boolean) => void
  onRemotePlaybackUpdate?: (position: number, isPlaying: boolean) => void
  initialPlaybackState?: {
    playback_position: number
    is_playing: boolean
  }
}

export function SynchronizedVideoPlayer({
  embedUrl,
  isHost,
  roomId,
  onPlaybackUpdate,
  onRemotePlaybackUpdate,
  initialPlaybackState
}: SynchronizedVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(initialPlaybackState?.is_playing || false)
  const [currentTime, setCurrentTime] = useState(initialPlaybackState?.playback_position || 0)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Handle remote playback updates (from other participants)
  useEffect(() => {
    if (onRemotePlaybackUpdate && !isHost) {
      const handleRemoteUpdate = (position: number, playing: boolean) => {
        setIsPlaying(playing)
        setCurrentTime(position)
        
        // Send commands to iframe
        if (iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage({
              type: 'SYNC_PLAYBACK',
              position,
              isPlaying: playing
            }, '*')
          } catch (error) {
            console.log('Could not sync with iframe:', error)
          }
        }
      }
      
      // Store the handler for cleanup
      ;(window as any).handleRemoteUpdate = handleRemoteUpdate
    }
  }, [onRemotePlaybackUpdate, isHost])

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false)
    
    // Set up message listener for iframe communication
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from any origin for embedded videos
      if (event.data.type === 'PLAYBACK_UPDATE' && isHost) {
        const { currentTime: time, isPlaying: playing } = event.data
        setCurrentTime(time)
        setIsPlaying(playing)
        onPlaybackUpdate(time, playing)
      }
    }

    window.addEventListener('message', handleMessage)

    // Initial sync if not host
    if (!isHost && initialPlaybackState) {
      setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'SYNC_PLAYBACK',
            position: initialPlaybackState.playback_position,
            isPlaying: initialPlaybackState.is_playing
          }, '*')
        }
      }, 1000)
    }

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }

  const handlePlayPause = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: isPlaying ? 'PAUSE' : 'PLAY'
      }, '*')
    }
  }

  const handleSeek = (time: number) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SEEK',
        time
      }, '*')
    }
    setCurrentTime(time)
    if (isHost) {
      onPlaybackUpdate(time, isPlaying)
    }
  }

  const handleMute = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: isMuted ? 'UNMUTE' : 'MUTE'
      }, '*')
    }
    setIsMuted(!isMuted)
  }

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    }
  }

  return (
    <div className="relative w-full h-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full"
        frameBorder="0"
        marginWidth={0}
        marginHeight={0}
        scrolling="no"
        allowFullScreen
        onLoad={handleIframeLoad}
        title="Synchronized Video Player"
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-xs">
              <input
                type="range"
                min="0"
                max="100"
                value={(currentTime / 100) * 100} // Assuming max duration of 100 minutes for demo
                onChange={(e) => handleSeek((parseFloat(e.target.value) / 100) * 100)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                disabled={!isHost}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Host Indicator */}
      {isHost && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
          🎮 Host Controls
        </div>
      )}

      {/* Connection Status */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Connected</span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #000000;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #000000;
        }
      `}</style>
    </div>
  )
}
