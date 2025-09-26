"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import { useWatchlist } from "@/hooks/use-watchlist"
import { cn } from "@/lib/utils"

interface WatchlistButtonProps {
  id: string
  type: "movie" | "tv"
  title: string
  poster_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function WatchlistButton({
  id,
  type,
  title,
  poster_path,
  vote_average,
  release_date,
  first_air_date,
  variant = "outline",
  size = "md",
  showText = true,
  className,
}: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [isAnimating, setIsAnimating] = useState(false)

  const inWatchlist = isInWatchlist(id, type)

  const handleClick = () => {
    setIsAnimating(true)

    if (inWatchlist) {
      removeFromWatchlist(id, type)
    } else {
      addToWatchlist({
        id,
        type,
        title,
        poster_path,
        vote_average,
        release_date,
        first_air_date,
      })
    }

    setTimeout(() => setIsAnimating(false), 300)
  }

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default"
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"

  return (
    <Button
      variant={variant}
      size={buttonSize}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200",
        inWatchlist && "bg-primary/20 border-primary text-primary hover:bg-primary/30",
        isAnimating && "scale-95",
        className,
      )}
    >
      {inWatchlist ? <Check className={cn(iconSize, "mr-2")} /> : <Plus className={cn(iconSize, "mr-2")} />}
      {showText && (inWatchlist ? "In Watchlist" : "Add to List")}
    </Button>
  )
}
