"use client";

import { useRouter } from "next/navigation"
import { MoviePlayer } from "@/components/movie-player"
import type { Movie } from "@/lib/types"

interface MoviePlayerWrapperProps {
  movie: Movie
  nextMovie: Movie | null
}

export function MoviePlayerWrapper({ movie, nextMovie }: MoviePlayerWrapperProps) {
  const router = useRouter()

  const handleNextMovie = () => {
    if (nextMovie) {
      router.push(`/movie/${nextMovie.id}`)
    }
  }

  return (
    <MoviePlayer 
      movie={movie} 
      nextMovie={nextMovie || undefined} 
      onNextMovie={handleNextMovie} 
    />
  )
}

