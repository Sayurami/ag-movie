"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className={cn("animate-spin-slow", sizeClasses[size], className)}>
      <svg
        className="h-full w-full text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="animate-bounce h-2 w-2 bg-primary rounded-full [animation-delay:-0.3s]"></div>
      <div className="animate-bounce h-2 w-2 bg-primary rounded-full [animation-delay:-0.15s]"></div>
      <div className="animate-bounce h-2 w-2 bg-primary rounded-full"></div>
    </div>
  )
}

interface LoadingTextProps {
  text?: string
  className?: string
}

export function LoadingText({ text = "Loading", className }: LoadingTextProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="animate-text-shimmer">{text}</span>
      <LoadingDots />
    </div>
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("animate-pulse-slow", className)}>
      <div className="bg-muted rounded-lg h-48 w-full mb-4"></div>
      <div className="space-y-2">
        <div className="bg-muted rounded h-4 w-3/4"></div>
        <div className="bg-muted rounded h-3 w-1/2"></div>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}

export function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground animate-fade-in">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}

