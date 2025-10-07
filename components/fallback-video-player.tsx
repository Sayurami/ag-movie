"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play, RefreshCw } from "lucide-react"

interface FallbackVideoPlayerProps {
  src: string
  title: string
  onRetry?: () => void
}

export function FallbackVideoPlayer({ src, title, onRetry }: FallbackVideoPlayerProps) {
  const [hasRetried, setHasRetried] = useState(false)

  const handleOpenInNewTab = () => {
    window.open(src, '_blank', 'noopener,noreferrer')
  }

  const handleRetry = () => {
    setHasRetried(true)
    onRetry?.()
  }

  return (
    <div className="flex items-center justify-center h-full bg-black/90 rounded-lg">
      <div className="text-center text-white p-8 max-w-md">
        <div className="mb-6">
          <Play className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Video Player Issue</h3>
          <p className="text-gray-300 mb-4">
            The video couldn't be embedded due to security restrictions. 
            You can still watch it by opening it in a new tab.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleOpenInNewTab}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Video in New Tab
          </Button>
          
          {!hasRetried && onRetry && (
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
        
        <p className="text-sm text-gray-400 mt-4">
          This usually happens when the video provider doesn't allow embedded playback.
        </p>
      </div>
    </div>
  )
}
